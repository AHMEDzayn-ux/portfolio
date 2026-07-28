import { Reveal } from "@/components/motion/reveal";
import { PublicationsCarousel } from "@/components/publications/publications-carousel";
import type { Publication } from "@/lib/data/types";

export function Publications({ publications }: { publications: Publication[] }) {
  if (publications.length === 0) return null;

  // Order is set in the admin (arrow up/down → sort_order), applied by the query.
  return (
    <section id="publications" className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Publications
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Things I&apos;ve written
        </h2>
      </Reveal>

      <PublicationsCarousel publications={publications} className="mt-12" />
    </section>
  );
}
