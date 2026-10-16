-- Run once after 008_fix_pending_request_insert.sql.
-- Short meetup chat. plan_id is the activity id. Only the host and accepted
-- guests can read or insert. Each person may send at most 5 messages per plan.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.activities(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 150),
  created_at timestamptz not null default now()
);
create index messages_plan_created on public.messages(plan_id, created_at asc);
create index messages_plan_sender on public.messages(plan_id, sender_id);

create or replace function public.prevent_message_overuse()
returns trigger
language plpgsql
as $$
declare
  sent_count integer;
begin
  select count(*) into sent_count
  from public.messages
  where plan_id = new.plan_id
    and sender_id = new.sender_id
    and id is distinct from new.id;
  if sent_count >= 5 then
    raise exception 'That''s all your messages - see you there!';
  end if;
  return new;
end;
$$;

create trigger messages_quota
before insert on public.messages
for each row execute procedure public.prevent_message_overuse();

alter table public.messages enable row level security;
revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to authenticated;

create policy "Read chat for host or accepted guests" on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = plan_id and a.host_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.activity_requests r
      where r.activity_id = plan_id
        and r.requester_user_id = (select auth.uid())
        and r.status = 'accepted'
    )
  );

create policy "Send chat as host or accepted guest" on public.messages
  for insert to authenticated
  with check (
    (select auth.uid()) = sender_id
    and (
      exists (
        select 1 from public.activities a
        where a.id = plan_id and a.host_user_id = (select auth.uid())
      )
      or exists (
        select 1 from public.activity_requests r
        where r.activity_id = plan_id
          and r.requester_user_id = (select auth.uid())
          and r.status = 'accepted'
      )
    )
  );
