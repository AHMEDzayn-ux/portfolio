"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { ExperienceEntry } from "@/lib/data/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function formatRange(entry: ExperienceEntry) {
  const start = new Date(entry.start_date).getFullYear();
  const end = entry.end_date ? new Date(entry.end_date).getFullYear() : "Present";
  return `${start} — ${end}`;
}

export function TimelineList({ entries }: { entries: ExperienceEntry[] }) {
  const trackRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !trackRef.current) return;

      const items = gsap.utils.toArray<HTMLElement>(trackRef.current.children);
      if (items.length === 0) return;

      gsap.set(items, { opacity: 0, y: 24 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: trackRef.current, start: "top 82%" },
      });

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: trackRef.current,
              start: "top 75%",
              end: "bottom 60%",
              scrub: 0.5,
            },
          }
        );
      }
    },
    { dependencies: [reducedMotion] }
  );

  return (
    <div className="relative mt-14">
      <div className="absolute inset-y-0 left-0 w-px bg-border/70" />
      <div
        ref={lineRef}
        aria-hidden
        className="absolute inset-y-0 left-0 w-px origin-top bg-brand"
      />
      <ol ref={trackRef} className="pl-8">
        {entries.map((entry) => (
          <li key={entry.id} className="relative mb-12 last:mb-0">
            <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-background" />
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">
              {formatRange(entry)} · {entry.type === "work" ? "Work" : "Education"}
            </p>
            <h3 className="mt-1 font-heading text-lg font-semibold tracking-tight">
              {entry.role}
            </h3>
            <p className="text-sm text-foreground/60">
              {entry.org}
              {entry.location ? ` · ${entry.location}` : ""}
            </p>
            {entry.description && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {entry.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
