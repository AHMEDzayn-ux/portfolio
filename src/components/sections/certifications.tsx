import { Reveal } from "@/components/motion/reveal";
import { CertificationsCarousel } from "@/components/certifications/certifications-carousel";
import type { Certification } from "@/lib/data/types";

export function Certifications({ certifications }: { certifications: Certification[] }) {
  if (certifications.length === 0) return null;

  const sorted = [...certifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section id="certifications" className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Certifications
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Licenses &amp; certifications
        </h2>
      </Reveal>

      <CertificationsCarousel certifications={sorted} className="mt-12" />
    </section>
  );
}
