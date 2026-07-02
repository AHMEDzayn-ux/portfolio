-- Starter project rows from the user's existing GitHub repos.
-- All editable/removable later via the admin panel.

insert into projects (title, slug, description, tags, repo_url, sort_order, featured, status)
values
  ('Disaster Management', 'disaster-management',
   'A system for coordinating and tracking disaster response efforts.',
   '{JavaScript}', 'https://github.com/AHMEDzayn-ux/Disaster-management', 1, true, 'published'),

  ('Flood Report', 'flood-report',
   'A tool for reporting and tracking flood incidents.',
   '{TypeScript}', 'https://github.com/AHMEDzayn-ux/test', 2, true, 'published'),

  ('Ceylon Cab Tours', 'ceylon-cab-tours',
   'A cab booking and tour service platform.',
   '{TypeScript}', 'https://github.com/AHMEDzayn-ux/ceyloncabtours', 3, true, 'published'),

  ('Court Booker', 'court-booker',
   'A booking system for reserving sports courts.',
   '{JavaScript}', 'https://github.com/AHMEDzayn-ux/courtBooker', 4, false, 'published'),

  ('RAG System', 'rag-system',
   'A Retrieval-Augmented Generation system built in Python.',
   '{Python}', 'https://github.com/AHMEDzayn-ux/RAG-new', 5, false, 'published')
on conflict (slug) do nothing;
