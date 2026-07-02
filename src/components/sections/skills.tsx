import { Reveal } from "@/components/motion/reveal";
import type { Skill } from "@/lib/data/types";

const CATEGORY_LABELS: Record<Skill["category"], string> = {
  engineering: "Engineering",
  design: "Design",
  tools: "Tools",
  other: "Other",
};

const CATEGORY_ORDER: Skill["category"][] = ["engineering", "design", "tools", "other"];

export function Skills({ skills }: { skills: Skill[] }) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  })).filter((group) => group.items.length > 0);

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

      <Reveal className="mt-12 grid gap-10 sm:grid-cols-2">
        {grouped.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
              {CATEGORY_LABELS[group.category]}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-brand/50 hover:text-foreground"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
