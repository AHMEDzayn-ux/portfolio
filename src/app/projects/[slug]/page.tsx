import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { MediaCarousel } from "@/components/projects/media-carousel";
import { ProjectHero } from "@/components/projects/project-hero";
import { getProjectBySlug, getPublishedProjectsStatic } from "@/lib/data/queries";
import { getProjectHero } from "@/lib/data/project-media";
import type { ProjectMedia } from "@/lib/data/types";

export async function generateStaticParams() {
  const projects = await getPublishedProjectsStatic();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const media: ProjectMedia[] = project.media ?? [];
  const hero: ProjectMedia | null = getProjectHero(project);

  return (
    <main>
      <ProjectHero project={project} hero={hero} />

      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        {/* Overview */}
        <Reveal className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
              Overview
            </h2>
            <div className="mt-5 space-y-4 whitespace-pre-line text-base leading-relaxed text-foreground/75 sm:text-lg">
              {project.long_description ?? project.description}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border/60 bg-card p-6">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground/60">
              Project details
            </h3>
            <dl className="mt-4 space-y-4 text-sm">
              {project.tags.length > 0 && (
                <div>
                  <dt className="text-foreground/50">Stack</dt>
                  <dd className="mt-1 text-foreground/85">
                    {project.tags.join(", ")}
                  </dd>
                </div>
              )}
              {project.live_url && (
                <div>
                  <dt className="text-foreground/50">Live</dt>
                  <dd className="mt-1">
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-brand hover:underline"
                    >
                      {project.live_url.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
              {project.repo_url && (
                <div>
                  <dt className="text-foreground/50">Source</dt>
                  <dd className="mt-1">
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-brand hover:underline"
                    >
                      {project.repo_url.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </Reveal>

        {/* Media gallery */}
        {media.length > 0 && (
          <Reveal className="mt-16">
            <h2 className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
              Gallery
            </h2>
            <MediaCarousel media={media} className="mt-6" />
          </Reveal>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-6 py-8 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Interested in something similar?
          </h2>
          <p className="max-w-md text-sm text-foreground/60">
            I&apos;m open to new projects and collaborations — let&apos;s build
            something great together.
          </p>
          <Link
            href="/#contact"
            className="mt-1 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.03]"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </main>
  );
}
