import { Reveal } from "@/components/motion/reveal";
import { CertificationsCarousel } from "@/components/certifications/certifications-carousel";
import type { Certification } from "@/lib/data/types";

export function Certifications({ certifications }: { certifications: Certification[] }) {
  if (certifications.length === 0) return null;

  // Order is set in the admin (arrow up/down → sort_order), applied by the query.
  return (
    <section id="certifications" className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          Certifications
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Licenses &amp; certifications
        </h2>
      </Reveal>

      <CertificationsCarousel certifications={certifications} className="mt-12" />
    </section>
  );
}
