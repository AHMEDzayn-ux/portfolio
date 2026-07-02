import { ExternalLink } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { Publication } from "@/lib/data/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

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

      <Reveal className="mt-12 space-y-4">
        {sorted.map((pub) => (
          <article
            key={pub.id}
            className="rounded-2xl border border-border/70 bg-secondary/20 p-6 transition-colors hover:border-brand/50"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-heading text-lg font-semibold tracking-tight">{pub.title}</h3>
              {pub.url && (
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read ${pub.title}`}
                  className="shrink-0 text-foreground/50 transition-colors hover:text-brand"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="mt-2 text-sm text-foreground/60">
              {pub.authors}
              {pub.venue ? ` · ${pub.venue}` : ""} · {formatDate(pub.publication_date)}
            </p>
            {pub.description && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {pub.description}
              </p>
            )}
          </article>
        ))}
      </Reveal>
    </section>
  );
}
