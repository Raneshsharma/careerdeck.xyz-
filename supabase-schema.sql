-- CareerDeck Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/iqzkcrvmcvlmwfweltie/sql/new)

-- 1. User Profiles
create table if not exists profiles (
  id uuid primary key,
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

-- 2. Generation Tracking
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  dossier_type text not null,
  company_name text,
  role text,
  created_at timestamp default now()
);

-- 3. Monthly count helper
create or replace function get_generations_this_month(user_uuid uuid)
returns integer as $$
  select count(*)::integer
  from generations
  where user_id = user_uuid
    and created_at >= date_trunc('month', now());
$$ language sql;
