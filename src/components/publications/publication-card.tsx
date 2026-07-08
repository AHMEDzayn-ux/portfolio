import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { formatMonthYear } from "@/lib/format-date";
import type { Publication } from "@/lib/data/types";

const DESCRIPTION_CLAMP_THRESHOLD = 100;

export function PublicationCard({ publication }: { publication: Publication }) {
  const isTruncated = (publication.description?.length ?? 0) > DESCRIPTION_CLAMP_THRESHOLD;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-brand/50">
      <div className="flex flex-1 flex-col gap-3 p-6">
        <Link href={`/publications/${publication.slug}`}>
          <h3 className="font-heading text-lg font-semibold tracking-tight transition-colors group-hover:text-brand">
            {publication.title}
          </h3>
        </Link>
        <p className="text-sm text-foreground/60">
          {publication.authors}
          {publication.venue ? ` · ${publication.venue}` : ""} ·{" "}
          {formatMonthYear(publication.publication_date)}
        </p>

        {publication.description && (
          <p className="line-clamp-2 min-h-0 flex-1 text-sm text-foreground/65">
            {publication.description}
          </p>
        )}

        {isTruncated && (
          <Link
            href={`/publications/${publication.slug}`}
            aria-label={`See more about ${publication.title}`}
            className="flex items-center gap-1 text-xs font-medium text-foreground/45 transition-colors hover:text-brand"
          >
            See more
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}

        <div className="mt-2 flex items-center gap-4 text-sm text-foreground/60">
          {publication.url && (
            <a
              href={publication.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-brand"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Paper
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
