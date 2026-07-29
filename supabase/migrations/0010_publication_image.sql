-- Publications now carry an optional cover image, so the home-page carousel
-- card can match the project card's layout (hero photo, then a short
-- description, with the rest on the detail page). Nullable rather than
-- certifications' `not null` image_url: existing rows have no image to
-- backfill, and the card/detail page already fall back to a plain text
-- treatment when it's absent (same as a project with no hero media).
alter table publications add column image_url text;
