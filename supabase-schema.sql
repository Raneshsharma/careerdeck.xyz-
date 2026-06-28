-- CareerDeck Supabase Schema (text ids for OAuth compatibility)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/iqzkcrvmcvlmwfweltie/sql/new
-- NOTE: Lines 5-7 are for fresh install ONLY. Skip them for existing databases.

-- Fresh install only (removes all data):
-- drop function if exists get_generations_this_month;
-- drop table if exists generations;
-- drop table if exists profiles;

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

-- ── Section Feedback (RLS not needed — all access via server admin client) ──
create table if not exists section_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  dossier_id uuid references generations(id) on delete cascade,
  section_key text not null,
  vote integer not null check (vote in (1, -1)),
  created_at timestamp default now(),
  unique (user_id, dossier_id, section_key)
);

create table if not exists section_comments (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  dossier_id uuid references generations(id) on delete cascade,
  section_key text not null,
  comment text not null,
  created_at timestamp default now()
);

-- ── RLS Migration (safe to run on existing DB — no data loss) ─────────────
alter table if exists profiles enable row level security;
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles for select using (auth.uid()::text = id);

alter table if exists generations enable row level security;  
drop policy if exists "Users can read own generations" on generations;
create policy "Users can read own generations" on generations for select using (auth.uid()::text = user_id);
drop policy if exists "Users can delete own generations" on generations;
create policy "Users can delete own generations" on generations for delete using (auth.uid()::text = user_id);
drop policy if exists "Users can insert own generations" on generations;
create policy "Users can insert own generations" on generations for insert with check (auth.uid()::text = user_id);

create table if not exists newsletter_subscribers (
  id serial primary key,
  email text not null unique,
  created_at timestamp default now()
);
