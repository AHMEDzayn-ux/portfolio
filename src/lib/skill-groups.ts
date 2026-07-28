/**
 * Skill display groups — the single source of truth shared by the public
 * Skills section and the admin editor.
 *
 * History: skills were originally stored under four broad categories
 * (engineering / design / tools / other). That's too coarse to scan — every
 * technical skill landed in one bucket, so a Postgres or an AWS disappeared
 * between a Figma and a Git. The public page started deriving finer groups
 * from the skill *name*, which fixed the reading experience but left the admin
 * showing the old four, with no way to say "this one is a database".
 *
 * Now the group is stored on the row (see migration 0009) and the name-based
 * matcher is only a fallback, for rows written before that migration. So an
 * explicit choice in the admin always wins, and a legacy row still lands
 * somewhere sensible instead of dumping into "Other".
 */

export const SKILL_GROUPS = [
  "languages",
  "frameworks",
  "databases",
  "ai",
  "cloud",
  "design",
  "tools",
  "other",
] as const;

export type SkillGroup = (typeof SKILL_GROUPS)[number];

/** Pre-0009 value that no longer has a group of its own. */
export type LegacySkillCategory = "engineering";

export type SkillCategory = SkillGroup | LegacySkillCategory;

export const SKILL_GROUP_LABELS: Record<SkillGroup, string> = {
  languages: "Languages",
  frameworks: "Frameworks & Libraries",
  databases: "Databases",
  ai: "AI, ML & Data",
  cloud: "Cloud & DevOps",
  design: "Design",
  tools: "Tools",
  other: "Other",
};

// Word-ish boundaries on both sides so "Java" can't swallow "JavaScript" and
// "R" can't match every name containing the letter. First match in
// SKILL_GROUPS order wins, so a name that could fit two groups (Supabase →
// database, not cloud) is settled by group order rather than regex precedence.
const GROUP_PATTERNS: Record<Exclude<SkillGroup, "other">, RegExp> = {
  // c++/c#/.net sit outside the \b(...)\b group: `+`, `#` and `.` aren't word
  // characters, so a trailing \b never matches after them.
  languages:
    /\b(type ?script|java ?script|python|java|kotlin|swift|dart|go|golang|rust|ruby|php|perl|scala|objective-c|matlab|sql|pl\/?sql|html|css|sass|scss|shell|bash|assembly|verilog|vhdl|r)\b|c\+\+|c#/i,
  frameworks:
    /\b(react|next\.?js|node\.?js|node|express|nest\.?js|vue|nuxt|angular|svelte|remix|astro|django|flask|fastapi|spring|laravel|rails|asp\.net|flutter|react native|jquery|bootstrap|tailwind|material ?ui|shadcn|redux|graphql|rest api|socket\.io)\b|\.net/i,
  databases:
    /\b(postgres(ql)?|mysql|maria ?db|sqlite|sql server|oracle|mongo ?db|firebase|firestore|supabase|redis|dynamo ?db|neo4j|cassandra|elasticsearch|prisma|drizzle|sequelize|database|dbms)\b/i,
  ai: /\b(ai|ml|machine learning|deep learning|neural|nlp|computer vision|tensor ?flow|py ?torch|keras|scikit|sklearn|pandas|numpy|matplotlib|open ?cv|hugging ?face|lang ?chain|llm|rag|data (science|analysis|analytics|visualization)|power ?bi|tableau|jupyter)\b/i,
  cloud:
    /\b(aws|amazon web services|azure|gcp|google cloud|docker|kubernetes|k8s|terraform|vercel|netlify|heroku|render|cloudflare|nginx|apache|linux|ubuntu|ci\/?cd|github actions|jenkins|serverless)\b/i,
  design:
    /\b(figma|ui\/?ux|ui|ux|user (interface|experience)|adobe|photoshop|illustrator|xd|canva|blender|wireframe|wireframing|prototyping|design system|typography|branding)\b/i,
  tools:
    /\b(git|git ?hub|git ?lab|bitbucket|vs ?code|visual studio|intellij|postman|jira|trello|notion|slack|figjam|excel|word|powerpoint|office|agile|scrum|testing|jest|cypress|selenium)\b/i,
};

function isSkillGroup(value: string): value is SkillGroup {
  return (SKILL_GROUPS as readonly string[]).includes(value);
}

function matchByName(name: string): SkillGroup | null {
  for (const group of SKILL_GROUPS) {
    if (group === "other") continue;
    if (GROUP_PATTERNS[group].test(name)) return group;
  }
  return null;
}

/**
 * Where a skill should render. An explicit stored group wins; "other" and the
 * legacy "engineering" fall through to the name matcher first, so old rows
 * still sort themselves and a deliberate "Other" (which typically matches no
 * pattern) stays put.
 */
export function resolveSkillGroup(name: string, category: string): SkillGroup {
  if (isSkillGroup(category) && category !== "other") return category;
  return matchByName(name) ?? (category === "engineering" ? "frameworks" : "other");
}
