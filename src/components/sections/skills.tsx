import { Reveal } from "@/components/motion/reveal";
import {
  SKILL_GROUPS,
  SKILL_GROUP_LABELS,
  resolveSkillGroup,
  type SkillGroup,
} from "@/lib/skill-groups";
import type { Skill } from "@/lib/data/types";

export function Skills({ skills }: { skills: Skill[] }) {
  // Grouping and labels live in @/lib/skill-groups, shared with the admin
  // editor so the boxes there are exactly the groups rendered here.
  const buckets = new Map<SkillGroup, Skill[]>();
  for (const skill of skills) {
    const key = resolveSkillGroup(skill.name, skill.category);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(skill);
    else buckets.set(key, [skill]);
  }

  const grouped = SKILL_GROUPS.map((key) => ({
    key,
    label: SKILL_GROUP_LABELS[key],
    items: buckets.get(key) ?? [],
  })).filter((group) => group.items.length > 0);

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
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
