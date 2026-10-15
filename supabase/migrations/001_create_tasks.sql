-- Run once in a NEW Supabase project's SQL editor.
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  created_at timestamptz not null default now()
);
create index tasks_user_created on public.tasks(user_id, created_at desc);
alter table public.tasks enable row level security;
revoke all on public.tasks from anon, authenticated;
grant select, insert, delete on public.tasks to authenticated;
create policy "Read own tasks" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own tasks" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Delete own tasks" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);
