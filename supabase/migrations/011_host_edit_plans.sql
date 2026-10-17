-- Run once in the existing Supabase project's SQL editor after 010_message_limit_ten.sql.
-- Hosts may edit title, time, place, and spaces until 12 hours before start.
-- Time/place changes are marked so accepted guests can see "Updated by host".
alter table public.activities
  add column if not exists details_updated_at timestamptz;

create or replace function public.enforce_host_plan_edits()
returns trigger
language plpgsql
as $$
declare
  accepted_count integer;
begin
  if old.starts_at <= now() + interval '12 hours' then
    raise exception 'Changes are locked 12 hours before the plan, because people have already said yes.';
  end if;

  select count(*) into accepted_count
  from public.activity_requests
  where activity_id = old.id
    and status = 'accepted';

  if new.max_participants < accepted_count + 1 then
    raise exception 'Cannot reduce spaces below the number already accepted';
  end if;

  if new.place is distinct from old.place
     or new.starts_at is distinct from old.starts_at then
    new.details_updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_host_plan_edits on public.activities;
create trigger enforce_host_plan_edits
  before update on public.activities
  for each row
  execute procedure public.enforce_host_plan_edits();
