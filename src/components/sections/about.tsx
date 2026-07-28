import { Reveal } from "@/components/motion/reveal";
import type { Profile } from "@/lib/data/types";

export function About({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand">
          About
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          A little about me
        </h2>
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-foreground/75 sm:text-lg">
          {profile.bio}
        </p>
        {profile.location && (
          <p className="mt-6 text-sm text-foreground/50">{profile.location}</p>
        )}
      </Reveal>
    </section>
  );
}
