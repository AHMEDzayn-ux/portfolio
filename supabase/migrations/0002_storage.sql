-- Storage buckets for avatar/project images and resume PDF.
-- Both public-read (resume is meant to be freely downloadable per project decision).

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resume', 'resume', true)
on conflict (id) do nothing;

-- public read on both buckets
create policy "public_assets_public_read" on storage.objects
  for select using (bucket_id = 'public-assets');
create policy "resume_public_read" on storage.objects
  for select using (bucket_id = 'resume');

-- admin-only write (insert/update/delete) on both buckets
create policy "public_assets_admin_write" on storage.objects
  for insert with check (bucket_id = 'public-assets' and auth.role() = 'authenticated');
create policy "public_assets_admin_update" on storage.objects
  for update using (bucket_id = 'public-assets' and auth.role() = 'authenticated');
create policy "public_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'public-assets' and auth.role() = 'authenticated');

create policy "resume_admin_write" on storage.objects
  for insert with check (bucket_id = 'resume' and auth.role() = 'authenticated');
create policy "resume_admin_update" on storage.objects
  for update using (bucket_id = 'resume' and auth.role() = 'authenticated');
create policy "resume_admin_delete" on storage.objects
  for delete using (bucket_id = 'resume' and auth.role() = 'authenticated');
