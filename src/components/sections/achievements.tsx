import { Award, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { formatMonthYear } from "@/lib/format-date";
import type { Achievement } from "@/lib/data/types";

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) return null;

  // Order is set in the admin (arrow up/down → sort_order), applied by the query.
  return (
    <section id="achievements" className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Achievements
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Awards &amp; honors
        </h2>
      </Reveal>

      <Reveal className="mt-12 grid gap-4 sm:grid-cols-2">
        {achievements.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-border/70 bg-secondary/20 p-6 transition-colors hover:border-brand/50"
          >
            <div className="flex items-start justify-between gap-4">
              <Award className="h-5 w-5 shrink-0 text-brand" />
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${item.title}`}
                  className="text-foreground/50 transition-colors hover:text-brand"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-foreground/60">
              {item.issuer ? `${item.issuer} · ` : ""}
              {formatMonthYear(item.date)}
            </p>
            {item.description && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {item.description}
              </p>
            )}
          </article>
        ))}
      </Reveal>
    </section>
  );
}
