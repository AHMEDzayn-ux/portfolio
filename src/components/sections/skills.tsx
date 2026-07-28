import { Reveal } from "@/components/motion/reveal";
import type { Skill } from "@/lib/data/types";

/**
 * Skills are stored under four broad database categories (engineering, design,
 * tools, other), which is too coarse to read at a glance — everything
 * technical lands in one 20-item wall where a Postgres or an AWS disappears
 * between a Figma and a Git. So the display groups are derived here from the
 * skill name instead: recruiters scan for "Databases" and "Cloud", not for
 * "Engineering".
 *
 * Matching is first-match-wins in GROUP_ORDER, so a name that could fit two
 * groups (Supabase → database, not cloud) is settled by group order rather
 * than by regex precedence. Anything unmatched falls back to its database
 * category, so a skill added later still shows up somewhere sensible.
 */
type GroupKey =
  | "languages"
  | "frameworks"
  | "databases"
  | "ai"
  | "cloud"
  | "design"
  | "tools";

const GROUP_LABELS: Record<GroupKey, string> = {
  languages: "Languages",
  frameworks: "Frameworks & Libraries",
  databases: "Databases",
  ai: "AI, ML & Data",
  cloud: "Cloud & DevOps",
  design: "Design",
  tools: "Tools",
};

const GROUP_ORDER: GroupKey[] = [
  "languages",
  "frameworks",
  "databases",
  "ai",
  "cloud",
  "design",
  "tools",
];

// Word-ish boundaries on both sides so "Java" can't swallow "JavaScript" and
// "R" can't match every name containing the letter.
const GROUP_PATTERNS: Record<GroupKey, RegExp> = {
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

// Skills that match nothing above keep their database category, mapped onto the
// closest display group ("other" gets its own bucket at the end).
const CATEGORY_FALLBACK: Record<Skill["category"], GroupKey | "other"> = {
  engineering: "frameworks",
  design: "design",
  tools: "tools",
  other: "other",
};

function groupFor(skill: Skill): GroupKey | "other" {
  for (const key of GROUP_ORDER) {
    if (GROUP_PATTERNS[key].test(skill.name)) return key;
  }
  return CATEGORY_FALLBACK[skill.category];
}

export function Skills({ skills }: { skills: Skill[] }) {
  const buckets = new Map<GroupKey | "other", Skill[]>();
  for (const skill of skills) {
    const key = groupFor(skill);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(skill);
    else buckets.set(key, [skill]);
  }

  const grouped = [...GROUP_ORDER, "other" as const]
    .map((key) => ({
      key,
      label: key === "other" ? "Other" : GROUP_LABELS[key],
      items: buckets.get(key) ?? [],
    }))
    .filter((group) => group.items.length > 0);

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Skills
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          What I work with
        </h2>
      </Reveal>

      {/* One flowing comma-separated line per group rather than a field of
          pills: pills of wildly different widths wrap into ragged columns that
          are slower to scan than plain prose. The label carries the structure,
          the dimmed commas carry the separation. */}
      <Reveal className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {grouped.map((group) => (
          <div
            key={group.key}
            className="border-t border-border/70 pt-4 transition-colors hover:border-brand/40"
          >
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-brand/80">
              {group.label}
            </h3>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-foreground/80">
              {group.items.map((skill, i) => (
                <span key={skill.id}>
                  {i > 0 && <span className="text-foreground/30">, </span>}
                  {skill.name}
                </span>
              ))}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
