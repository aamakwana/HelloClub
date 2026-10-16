-- Run once in the existing Supabase project's SQL editor after 003_activity_audience_preference.sql.
-- Join requests only. Hosts cannot change status yet; that is a later task.
create table public.activity_requests (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (activity_id, requester_user_id)
);
create index activity_requests_requester_created on public.activity_requests(requester_user_id, created_at desc);
create index activity_requests_activity_status on public.activity_requests(activity_id, status);

create or replace function public.prevent_overfilling_accepted_guests()
returns trigger
language plpgsql
as $$
declare
  guest_limit integer;
  accepted_count integer;
begin
  select max_participants - 1 into guest_limit
  from public.activities
  where id = new.activity_id;
  if guest_limit is null then
    raise exception 'Activity not found';
  end if;
  select count(*) into accepted_count
  from public.activity_requests
  where activity_id = new.activity_id
    and status = 'accepted'
    and id is distinct from new.id;
  if accepted_count >= guest_limit then
    raise exception 'This plan already has a full guest list';
  end if;
  return new;
end;
$$;

create trigger activity_requests_capacity
before insert or update of status on public.activity_requests
for each row execute procedure public.prevent_overfilling_accepted_guests();

alter table public.activity_requests enable row level security;
revoke all on public.activity_requests from anon, authenticated;
grant select, insert on public.activity_requests to authenticated;

create policy "Read own activity requests" on public.activity_requests
  for select to authenticated
  using ((select auth.uid()) = requester_user_id);

create policy "Hosts read requests for their activities" on public.activity_requests
  for select to authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id and a.host_user_id = (select auth.uid())
    )
  );

create policy "Create own pending activity requests" on public.activity_requests
  for insert to authenticated
  with check (
    (select auth.uid()) = requester_user_id
    and status = 'pending'
    and exists (
      select 1 from public.activities a
      where a.id = activity_id
        and a.host_user_id is distinct from (select auth.uid())
        and a.starts_at > now()
    )
  );
