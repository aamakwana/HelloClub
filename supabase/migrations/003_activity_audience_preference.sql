-- Run once in the existing Supabase project's SQL editor after 002_create_activities.sql.
-- Host preference only; this does not verify gender or enforce who may join.
alter table public.activities
  add column audience_preference text not null default 'everyone'
  check (audience_preference in ('everyone', 'women_only', 'men_only'));
