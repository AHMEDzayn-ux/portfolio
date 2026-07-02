import type { Profile } from "@/lib/data/types";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-foreground/50 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {profile.full_name}. All rights reserved.
        </p>
        <a href="#hero" className="transition-colors hover:text-brand">
          Back to top
        </a>
      </div>
    </footer>
  );
}
