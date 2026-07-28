-- Skill display groups.
--
-- The original four categories (design / engineering / tools / other) were too
-- coarse to scan on the public page: everything technical landed in one bucket.
-- The site worked around it by guessing finer groups from the skill name, which
-- meant the admin had no way to say "this one is a database" — and no way to
-- correct a wrong guess.
--
-- This widens the category check to the display groups the site actually
-- renders, and backfills the obvious cases. 'engineering' stays allowed so
-- existing rows remain valid; the app falls back to name matching for those,
-- and any skill re-saved through the admin bulk editor gets an explicit group.

alter table skills drop constraint if exists skills_category_check;

alter table skills
  add constraint skills_category_check
  check (
    category in (
      'languages',
      'frameworks',
      'databases',
      'ai',
      'cloud',
      'design',
      'tools',
      'other',
      -- legacy, kept valid so this migration never rejects an existing row
      'engineering'
    )
  );

-- Backfill, in the same precedence order the application uses: first match
-- wins, so each statement only touches rows still holding a legacy value.
update skills set category = 'languages'
where category in ('engineering', 'other')
  and (
    name ~* '\y(typescript|type script|javascript|java script|python|java|kotlin|swift|dart|go|golang|rust|ruby|php|perl|scala|matlab|sql|html|css|sass|scss|shell|bash)\y'
    or name ~* '(c\+\+|c#)'
  );

update skills set category = 'frameworks'
where category in ('engineering', 'other')
  and name ~* '\y(react|next\.?js|node\.?js|node|express|vue|nuxt|angular|svelte|django|flask|fastapi|spring|laravel|rails|flutter|jquery|bootstrap|tailwind|redux|graphql)\y';

update skills set category = 'databases'
where category in ('engineering', 'other')
  and name ~* '\y(postgres|postgresql|mysql|mariadb|sqlite|oracle|mongodb|mongo db|firebase|firestore|supabase|redis|prisma|database|dbms)\y';

update skills set category = 'ai'
where category in ('engineering', 'other')
  and name ~* '\y(ai|ml|machine learning|deep learning|nlp|computer vision|tensorflow|pytorch|keras|scikit|sklearn|pandas|numpy|opencv|langchain|llm|power bi|tableau|jupyter)\y';

update skills set category = 'cloud'
where category in ('engineering', 'other')
  and name ~* '\y(aws|azure|gcp|google cloud|docker|kubernetes|terraform|vercel|netlify|heroku|cloudflare|nginx|apache|linux|ubuntu|jenkins)\y';

update skills set category = 'design'
where category in ('engineering', 'other')
  and name ~* '\y(figma|ui|ux|adobe|photoshop|illustrator|canva|blender|wireframe|prototyping|typography|branding)\y';

update skills set category = 'tools'
where category in ('engineering', 'other')
  and name ~* '\y(git|github|gitlab|bitbucket|vs code|visual studio|intellij|postman|jira|trello|notion|excel|powerpoint|agile|scrum|jest|cypress|selenium)\y';
