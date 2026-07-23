"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowUpRight, FolderGit2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { Project, ProjectMedia } from "@/lib/data/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const reducedItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

/**
 * Cinematic hero header for a project's detail page. Fades/slides the
 * background media and copy in on arrival so navigating here from a project
 * card feels like a continuation rather than a hard cut.
 */
export function ProjectHero({
  project,
  hero,
}: {
  project: Project;
  hero: ProjectMedia | null;
}) {
  const reduced = useReducedMotion();
  const textItem = reduced ? reducedItem : item;
  const textContainer = reduced ? { hidden: {}, show: {} } : container;

  return (
    <div className="relative overflow-hidden bg-black">
      {hero && (
        <>
          {hero.type === "image" ? (
            <motion.img
              src={hero.url}
              alt=""
              aria-hidden
              fetchPriority="high"
              decoding="async"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
          ) : (
            <motion.video
              src={hero.url}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black" />
        </>
      )}

      <motion.div
        variants={textContainer}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-5xl px-6 pb-14 pt-28 text-white sm:pt-32"
      >
        <motion.div variants={textItem}>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </motion.div>

        <motion.h1
          variants={textItem}
          className="mt-8 max-w-3xl font-heading text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl"
        >
          {project.title}
        </motion.h1>

        <motion.p
          variants={textItem}
          className="mt-4 max-w-2xl text-balance text-base text-white/70 sm:text-lg"
        >
          {project.description}
        </motion.p>

        {project.tags.length > 0 && (
          <motion.ul variants={textItem} className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
              >
                {tag}
              </li>
            ))}
          </motion.ul>
        )}

        <motion.div
          variants={textItem}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
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
        </motion.div>
      </motion.div>
    </div>
  );
}
