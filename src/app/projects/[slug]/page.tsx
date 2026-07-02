import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FolderGit2 } from "lucide-react";
import { MediaCarousel } from "@/components/projects/media-carousel";
import { getProjectBySlug, getPublishedProjectsStatic } from "@/lib/data/queries";
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
  const hero: ProjectMedia | null =
    project.hero ??
    (project.image_url ? { url: project.image_url, type: "image" } : null);

  return (
    <main>
      {/* Cinematic hero header — admin-uploaded photo/video as background */}
      <div className="relative overflow-hidden bg-black">
        {hero && (
          <>
            {hero.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.url}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
            ) : (
              <video
                src={hero.url}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black" />
          </>
        )}

        <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-28 text-white sm:pt-32">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>

          <h1 className="mt-8 max-w-3xl font-heading text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            {project.title}
          </h1>

          <p className="mt-4 max-w-2xl text-balance text-base text-white/70 sm:text-lg">
            {project.description}
          </p>

          {project.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.03]"
              >
                <ArrowUpRight className="h-4 w-4" />
                Live demo
              </a>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:border-brand/70 hover:text-white"
              >
                <FolderGit2 className="h-4 w-4" />
                View code
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        {/* Overview */}
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
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
        </div>

        {/* Media gallery */}
        {media.length > 0 && (
          <div className="mt-16">
            <h2 className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
              Gallery
            </h2>
            <MediaCarousel media={media} className="mt-6" />
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Interested in something similar?
          </h2>
          <p className="max-w-md text-sm text-foreground/60">
            I&apos;m open to new projects and collaborations — let&apos;s build
            something great together.
          </p>
          <Link
            href="/#contact"
            className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.03]"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </main>
  );
}
