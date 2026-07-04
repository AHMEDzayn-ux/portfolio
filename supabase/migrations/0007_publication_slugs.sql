-- Adds a slug to publications so each entry can have its own detail page,
-- mirroring how projects work.
alter table publications add column slug text;

update publications
set slug = trim(both '-' from regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g'));

-- Deduplicate any collisions (e.g. two publications with the same title).
with dupes as (
  select id, slug, row_number() over (partition by slug order by created_at) as rn
  from publications
)
update publications p
set slug = p.slug || '-' || substr(p.id::text, 1, 8)
from dupes d
where p.id = d.id and d.rn > 1;

alter table publications alter column slug set not null;
alter table publications add constraint publications_slug_key unique (slug);
