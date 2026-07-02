"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

function subscribeNoop() {
  return () => {};
}

// Hydration-safe "has the client taken over yet" flag: server always renders
// false, client always renders true, so the icon only reflects resolvedTheme
// after hydration completes and can't cause a server/client mismatch.
function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

export function ThemeToggle({
  className = "border-border/60 text-foreground/80",
}: {
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(
        () => setTheme(next)
      );
    } else {
      setTheme(next);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-brand/60 hover:text-brand ${className}`}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
