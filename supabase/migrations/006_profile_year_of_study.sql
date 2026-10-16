-- Run once in the existing Supabase project's SQL editor after 005_create_profiles.sql.
-- Nullable so existing completed profiles stay valid and are not sent back through onboarding.
alter table public.profiles
  add column year_of_study text
  check (
    year_of_study is null
    or year_of_study in ('year_1', 'year_2', 'year_3', 'year_4', 'year_5', 'year_6_plus', 'phd', 'other')
  );
