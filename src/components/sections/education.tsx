import { Reveal } from "@/components/motion/reveal";
import { EducationTimelineList } from "@/components/education/timeline-list";
import type { EducationEntry } from "@/lib/data/types";

export function Education({ entries }: { entries: EducationEntry[] }) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <section id="education" className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Education
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Where I&apos;ve studied
        </h2>
      </Reveal>

      <EducationTimelineList entries={sorted} />
    </section>
  );
}
