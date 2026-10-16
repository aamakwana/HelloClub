-- Run once in the existing Supabase project's SQL editor after 004_create_activity_requests.sql.
-- Full profiles are private. Host first names are copied to a limited public-name table.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (length(trim(first_name)) between 1 and 80),
  last_name text not null check (length(trim(last_name)) between 1 and 80),
  gender text not null check (gender in ('male', 'female', 'nonbinary', 'prefer_not_to_say')),
  age integer not null check (age between 16 and 120),
  study_programme text not null check (length(trim(study_programme)) between 1 and 120),
  school_option text not null check (school_option in ('NTNU', 'BI', 'Other')),
  school_name text not null check (length(trim(school_name)) between 1 and 120),
  city text not null check (city = 'Trondheim'),
  languages text[] not null check (
    cardinality(languages) between 1 and 2
    and languages <@ array['english', 'norwegian']::text[]
  ),
  interests text[] not null check (
    cardinality(interests) >= 1
    and interests <@ array['Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other']::text[]
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_public_names (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  first_name text not null check (length(trim(first_name)) between 1 and 80)
);

create or replace function public.sync_profile_public_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile_public_names (user_id, first_name)
  values (new.user_id, btrim(new.first_name))
  on conflict (user_id) do update set first_name = excluded.first_name;
  return new;
end;
$$;

create trigger profiles_sync_public_name
after insert or update of first_name on public.profiles
for each row execute procedure public.sync_profile_public_name();

alter table public.profiles enable row level security;
alter table public.profile_public_names enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.profile_public_names from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.profile_public_names to authenticated;

create policy "Read own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Create own profile" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Read host first names" on public.profile_public_names
  for select to authenticated
  using ((select auth.uid()) is not null);
