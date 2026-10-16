-- Run once after 009_create_messages.sql.
-- Raise the per-user chat quota from 5 to 10 messages per plan.
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
  if sent_count >= 10 then
    raise exception 'That''s all your messages - see you there!';
  end if;
  return new;
end;
$$;
