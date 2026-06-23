-- CareerDeck Supabase Schema (corrected: text ids for Google OAuth compatibility)
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/iqzkcrvmcvlmwfweltie/sql/new

drop function if exists get_generations_this_month;
drop table if exists generations;
drop table if exists profiles;

create table profiles (
  id text primary key,
  email text,
  name text,
  avatar_url text,
  industry text,
  experience_level text,
  plan_tier text default 'free',
  onboarded boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid()::text = id);

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id text references profiles(id) on delete cascade not null,
  dossier_type text not null,
  company_name text,
  role text,
  content text,
  created_at timestamp default now()
);

alter table generations enable row level security;

create policy "Users can read own generations"
  on generations for select
  using (auth.uid()::text = user_id);

create policy "Users can delete own generations"
  on generations for delete
  using (auth.uid()::text = user_id);

create or replace function get_generations_this_month(user_uuid text)
returns integer as $$
  select count(*)::integer
  from generations
  where user_id = user_uuid
    and created_at >= date_trunc('month', now());
$$ language sql;
