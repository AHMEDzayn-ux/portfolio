"use client";

import { FlowCarousel } from "@/components/ui/flow-carousel";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/lib/data/types";

/**
 * Home-page project carousel: three cards per view on desktop, two on tablet,
 * one on mobile. Behavior (mouse-follow flow, snapping, arrows, dots) lives
 * in FlowCarousel.
 */
export function ProjectsCarousel({
  projects,
  className,
}: {
  projects: Project[];
  className?: string;
}) {
  return (
    <FlowCarousel
      className={className}
      ariaLabel="projects"
      slideClassName="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </FlowCarousel>
  );
}
