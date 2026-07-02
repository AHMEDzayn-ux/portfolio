-- Optional hero background for the project detail page: a single
-- { url, type } object ("image" | "video"), uploaded via the admin panel.

alter table public.projects
  add column if not exists hero jsonb;
