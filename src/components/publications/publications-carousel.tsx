"use client";

import { FlowCarousel } from "@/components/ui/flow-carousel";
import { PublicationCard } from "@/components/publications/publication-card";
import type { Publication } from "@/lib/data/types";

/**
 * Home-page publication carousel: three cards per view on desktop, two on
 * tablet, one on mobile. Mirrors ProjectsCarousel.
 */
export function PublicationsCarousel({
  publications,
  className,
}: {
  publications: Publication[];
  className?: string;
}) {
  return (
    <FlowCarousel
      className={className}
      ariaLabel="publications"
      slideClassName="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
    >
      {publications.map((publication) => (
        <PublicationCard key={publication.id} publication={publication} />
      ))}
    </FlowCarousel>
  );
}
