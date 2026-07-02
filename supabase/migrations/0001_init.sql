-- Portfolio site schema: profile, projects, skills, experience, contact_messages
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------- updated_at trigger helper ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- profile (singleton) ----------
create table profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default '',
  title text not null default '',
  bio text not null default '',
  short_tagline text not null default '',
  avatar_url text,
  resume_url text,
  email text,
  github_url text,
  linkedin_url text,
  telegram_url text,
  twitter_url text,
  location text,
  updated_at timestamptz not null default now()
);

create trigger profile_set_updated_at
  before update on profile
  for each row execute function set_updated_at();

-- ---------- projects ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  long_description text,
  tags text[] not null default '{}',
  repo_url text,
  live_url text,
  image_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create index projects_status_sort_idx on projects (status, sort_order);

-- ---------- skills ----------
create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other' check (category in ('design', 'engineering', 'tools', 'other')),
  icon text,
  level int check (level between 0 and 100),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger skills_set_updated_at
  before update on skills
  for each row execute function set_updated_at();

-- ---------- experience ----------
create table experience (
  id uuid primary key default gen_random_uuid(),
  org text not null,
  role text not null,
  description text,
  start_date date not null,
  end_date date,
  type text not null check (type in ('work', 'education')),
  location text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger experience_set_updated_at
  before update on experience
  for each row execute function set_updated_at();

-- ---------- contact_messages ----------
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profile enable row level security;
alter table projects enable row level security;
alter table skills enable row level security;
alter table experience enable row level security;
alter table contact_messages enable row level security;

-- profile: public read, admin write
create policy "profile_public_read" on profile
  for select using (true);
create policy "profile_admin_write" on profile
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- projects: public read of published rows, admin sees/writes everything
create policy "projects_public_read_published" on projects
  for select using (status = 'published' or auth.role() = 'authenticated');
create policy "projects_admin_write" on projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- skills: public read, admin write
create policy "skills_public_read" on skills
  for select using (true);
create policy "skills_admin_write" on skills
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- experience: public read, admin write
create policy "experience_public_read" on experience
  for select using (true);
create policy "experience_admin_write" on experience
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- contact_messages: anon can insert only, admin can read/update, nobody deletes by default
create policy "contact_messages_anon_insert" on contact_messages
  for insert with check (auth.role() = 'anon' or auth.role() = 'authenticated');
create policy "contact_messages_admin_read" on contact_messages
  for select using (auth.role() = 'authenticated');
create policy "contact_messages_admin_update" on contact_messages
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- seed the singleton profile row so the app always has one row to read/update
insert into profile (full_name, title, short_tagline)
values ('Ahmedh M.R.R', 'Software Developer', 'Building things for the web.');
