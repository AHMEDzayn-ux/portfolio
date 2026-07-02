-- Adds education, publications, and achievements — three new resume-style
-- sections distinct from the existing work/education `experience` timeline.

-- ---------- education ----------
create table education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field_of_study text,
  grade text,
  description text,
  start_date date not null,
  end_date date,
  location text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger education_set_updated_at
  before update on education
  for each row execute function set_updated_at();

-- ---------- publications ----------
create table publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text not null,
  venue text,
  publication_date date not null,
  url text,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger publications_set_updated_at
  before update on publications
  for each row execute function set_updated_at();

-- ---------- achievements ----------
create table achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  description text,
  url text,
  date date not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger achievements_set_updated_at
  before update on achievements
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table education enable row level security;
alter table publications enable row level security;
alter table achievements enable row level security;

create policy "education_public_read" on education
  for select using (true);
create policy "education_admin_write" on education
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "publications_public_read" on publications
  for select using (true);
create policy "publications_admin_write" on publications
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "achievements_public_read" on achievements
  for select using (true);
create policy "achievements_admin_write" on achievements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
