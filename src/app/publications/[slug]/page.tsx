import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { formatMonthYear } from "@/lib/format-date";
import { getPublicationBySlug, getPublicationsStatic } from "@/lib/data/queries";

export async function generateStaticParams() {
  const publications = await getPublicationsStatic();
  return publications.map((publication) => ({ slug: publication.slug }));
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);

  if (!publication) notFound();

  return (
    <main>
      <div className="relative overflow-hidden bg-black">
        <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-28 text-white sm:pt-32">
          <Link
            href="/#publications"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to publications
          </Link>

          <h1 className="mt-8 max-w-3xl font-heading text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            {publication.title}
          </h1>

          <p className="mt-4 max-w-2xl text-balance text-base text-white/70 sm:text-lg">
            {publication.authors}
            {publication.venue ? ` · ${publication.venue}` : ""} ·{" "}
            {formatMonthYear(publication.publication_date)}
          </p>

          {publication.url && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={publication.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.03]"
              >
                <ExternalLink className="h-4 w-4" />
                Read paper
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        {publication.description && (
          <Reveal>
            <h2 className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
              Overview
            </h2>
            <div className="mt-5 whitespace-pre-line text-base leading-relaxed text-foreground/75 sm:text-lg">
              {publication.description}
            </div>
          </Reveal>
        )}

        <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-6 py-8 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Interested in collaborating on research?
          </h2>
          <p className="max-w-md text-sm text-foreground/60">
            I&apos;m always open to discussing new ideas and research
            collaborations — let&apos;s connect.
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
