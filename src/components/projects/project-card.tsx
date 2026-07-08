import Link from "next/link";
import { ArrowRight, ArrowUpRight, FolderGit2 } from "lucide-react";
import { getProjectHero } from "@/lib/data/project-media";
import type { Project } from "@/lib/data/types";

const DESCRIPTION_CLAMP_THRESHOLD = 100;

export function ProjectCard({ project }: { project: Project }) {
  const hero = getProjectHero(project);
  const isTruncated = project.description.length > DESCRIPTION_CLAMP_THRESHOLD;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-brand/50">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50">
          {hero ? (
            hero.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.card_url ?? hero.url}
                alt={project.title}
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <video
                src={hero.url}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-heading text-2xl font-semibold text-foreground/15">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <Link href={`/projects/${project.slug}`}>
          <h3 className="font-heading text-lg font-semibold tracking-tight transition-colors group-hover:text-brand">
            {project.title}
          </h3>
        </Link>
        <p className="line-clamp-2 min-h-0 flex-1 text-sm text-foreground/65">
          {project.description}
        </p>

        {project.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-secondary/70 px-2.5 py-1 text-xs text-foreground/60"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {isTruncated && (
          <Link
            href={`/projects/${project.slug}`}
            className="flex items-center gap-1 text-xs font-medium text-foreground/45 transition-colors hover:text-brand"
          >
            See more
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}

        <div className="mt-2 flex items-center gap-4 text-sm text-foreground/60">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-brand"
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              Code
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-brand"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
