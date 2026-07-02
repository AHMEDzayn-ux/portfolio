-- Media gallery for projects: array of { url, type } objects where type is
-- "image" or "video". Files live in the public-assets bucket.

alter table public.projects
  add column if not exists media jsonb not null default '[]'::jsonb;
