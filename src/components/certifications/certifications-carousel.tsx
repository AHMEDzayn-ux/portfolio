"use client";

import { FlowCarousel } from "@/components/ui/flow-carousel";
import { CertificationCard } from "@/components/certifications/certification-card";
import type { Certification } from "@/lib/data/types";

/**
 * Home-page certification carousel: three cards per view on desktop, two on
 * tablet, one on mobile. Mirrors ProjectsCarousel. Each card opens a popup with
 * the enlarged certificate image (behavior lives in CertificationCard).
 */
export function CertificationsCarousel({
  certifications,
  className,
}: {
  certifications: Certification[];
  className?: string;
}) {
  return (
    <FlowCarousel
      className={className}
      ariaLabel="certifications"
      slideClassName="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
    >
      {certifications.map((certification) => (
        <CertificationCard key={certification.id} certification={certification} />
      ))}
    </FlowCarousel>
  );
}
