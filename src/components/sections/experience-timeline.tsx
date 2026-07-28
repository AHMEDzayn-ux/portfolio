import { Reveal } from "@/components/motion/reveal";
import { TimelineList } from "@/components/experience/timeline-list";
import type { ExperienceEntry } from "@/lib/data/types";

export function ExperienceTimeline({ entries }: { entries: ExperienceEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Experience
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Where I&apos;ve been
        </h2>
      </Reveal>

      <TimelineList entries={sorted} />
    </section>
  );
}
