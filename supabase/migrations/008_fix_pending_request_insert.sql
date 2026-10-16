-- Run once after 007_host_request_decisions.sql.
-- 007 applied SELECT ... FOR UPDATE on activities for every activity_requests
-- insert. Requesters can read activities but cannot lock host-owned rows under RLS,
-- so pending join requests failed. Lock only when a row is becoming accepted.
create or replace function public.prevent_overfilling_accepted_guests()
returns trigger
language plpgsql
as $$
declare
  guest_limit integer;
  accepted_count integer;
  starts_at timestamptz;
begin
  if tg_op = 'INSERT' and new.status is distinct from 'accepted' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.activity_id is distinct from old.activity_id
       or new.requester_user_id is distinct from old.requester_user_id then
      raise exception 'Cannot change request ownership';
    end if;
    if old.status is distinct from 'pending' then
      raise exception 'Only pending requests can be decided';
    end if;
    if new.status not in ('accepted', 'declined') then
      raise exception 'Invalid request status';
    end if;
    if new.status is distinct from 'accepted' then
      return new;
    end if;
  end if;

  select max_participants - 1, activities.starts_at
    into guest_limit, starts_at
  from public.activities
  where id = new.activity_id
  for update;

  if guest_limit is null then
    raise exception 'Activity not found';
  end if;

  if starts_at <= now() then
    raise exception 'This plan has already started';
  end if;

  select count(*) into accepted_count
  from public.activity_requests
  where activity_id = new.activity_id
    and status = 'accepted'
    and id is distinct from new.id;

  if accepted_count >= guest_limit then
    raise exception 'This activity is full';
  end if;
  return new;
end;
$$;
