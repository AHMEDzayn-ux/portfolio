import { Reveal } from "@/components/motion/reveal";
import { PublicationsCarousel } from "@/components/publications/publications-carousel";
import type { Publication } from "@/lib/data/types";

export function Publications({ publications }: { publications: Publication[] }) {
  if (publications.length === 0) return null;

  const sorted = [...publications].sort(
    (a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime()
  );

  return (
    <section id="publications" className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Publications
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Things I&apos;ve written
        </h2>
      </Reveal>

      <PublicationsCarousel publications={sorted} className="mt-12" />
    </section>
  );
}
