-- Run once in the existing Supabase project's SQL editor after 001_create_tasks.sql.
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  category text not null check (category in ('Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other')),
  place text not null check (length(trim(place)) between 1 and 200),
  starts_at timestamptz not null,
  max_participants integer not null check (max_participants between 2 and 50),
  description text check (description is null or length(trim(description)) <= 500),
  created_at timestamptz not null default now()
);
create index activities_host_created on public.activities(host_user_id, created_at desc);
create index activities_starts_at on public.activities(starts_at);
alter table public.activities enable row level security;
revoke all on public.activities from anon, authenticated;
grant select, insert, update, delete on public.activities to authenticated;
create policy "Read activities when signed in" on public.activities
  for select to authenticated
  using ((select auth.uid()) is not null);
create policy "Create own activities" on public.activities
  for insert to authenticated
  with check ((select auth.uid()) = host_user_id);
create policy "Update own activities" on public.activities
  for update to authenticated
  using ((select auth.uid()) = host_user_id)
  with check ((select auth.uid()) = host_user_id);
create policy "Delete own activities" on public.activities
  for delete to authenticated
  using ((select auth.uid()) = host_user_id);
