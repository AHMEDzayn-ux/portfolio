import { Reveal } from "@/components/motion/reveal";
import { ProjectsCarousel } from "@/components/projects/projects-carousel";
import type { Project } from "@/lib/data/types";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Projects
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Selected work
        </h2>
      </Reveal>

      {projects.length === 0 ? (
        <p className="mt-12 text-foreground/50">Projects coming soon.</p>
      ) : (
        <ProjectsCarousel projects={projects} className="mt-12" />
      )}
    </section>
  );
}
