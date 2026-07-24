-- Adds certifications — a resume-style section like achievements, but each
-- certification carries a certificate image (shown on the card and enlarged in
-- a popup) plus an optional credential/verify link.

create table certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  description text,
  image_url text not null,
  credential_url text,
  date date not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger certifications_set_updated_at
  before update on certifications
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table certifications enable row level security;

create policy "certifications_public_read" on certifications
  for select using (true);
create policy "certifications_admin_write" on certifications
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
