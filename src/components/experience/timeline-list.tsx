"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { formatYear } from "@/lib/format-date";
import type { ExperienceEntry } from "@/lib/data/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function formatRange(entry: ExperienceEntry) {
  const start = formatYear(entry.start_date);
  const end = entry.end_date ? formatYear(entry.end_date) : "Present";
  return `${start} — ${end}`;
}

/**
 * Roles outside the technical track (retail, call-centre, hospitality) still
 * belong on the page — they show a work history — but giving them the same
 * headline-plus-paragraph block as an engineering role buries the engineering
 * roles in the middle of a long scroll. Matching ones render as a single
 * condensed line under a quieter heading instead. Anything unmatched is
 * treated as technical, so a new role always gets the full treatment by
 * default rather than being silently demoted.
 */
const NON_TECHNICAL_ROLE =
  /\b(call ?cent(er|re)|customer (service|support|care)|tele(marketing|sales|caller)|cashier|sales ?(assistant|associate|rep|representative|executive)?|retail|waiter|waitress|barista|host(ess)?|receptionist|front desk|steward|delivery|driver|security guard|packer|store ?keeper|data entry|teller|promoter|crew member)\b/i;

function isNonTechnical(entry: ExperienceEntry) {
  return (
    entry.type === "work" &&
    NON_TECHNICAL_ROLE.test(entry.role) &&
    // "Sales Engineer" or "Support Engineer" are technical despite the match.
    !/\b(engineer|developer|programmer|analyst|scientist|architect|devops|designer|intern(ship)? .*(software|data|ai))\b/i.test(
      entry.role
    )
  );
}

const BULLET_PREFIX = /^\s*[-–—•*·]\s+/;

/**
 * Descriptions are free text typed in the admin, and bullet lists get written
 * there the natural way — one item per line, often with a leading dash. HTML
 * collapses those newlines, so the whole list used to render as one run-on
 * paragraph. Split it back apart: newlines first, falling back to inline "•"
 * separators for descriptions pasted from a CV as a single line.
 *
 * Returns [] when the text is genuinely a paragraph, so prose still renders
 * as prose rather than as a one-item list.
 */
function toBullets(description: string): string[] {
  const lines = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items =
    lines.length > 1
      ? lines
      : description
          .split(/\s+[•·]\s+/)
          .map((part) => part.trim())
          .filter(Boolean);

  if (items.length > 1) return items.map((item) => item.replace(BULLET_PREFIX, ""));
  // A single line still counts as a bullet if it was written as one.
  if (items.length === 1 && BULLET_PREFIX.test(items[0])) {
    return [items[0].replace(BULLET_PREFIX, "")];
  }
  return [];
}

export function TimelineList({ entries }: { entries: ExperienceEntry[] }) {
  const primary = entries.filter((entry) => !isNonTechnical(entry));
  const secondary = entries.filter(isNonTechnical);
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
        {primary.map((entry) => {
          const bullets = entry.description ? toBullets(entry.description) : [];
          return (
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
            {entry.description &&
              (bullets.length > 0 ? (
                <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/70">
                  {bullets.map((bullet, i) => (
                    <li key={i} className="relative pl-4">
                      {/* Absolute dot rather than list-disc so wrapped lines
                          hang under the text, not under the marker. */}
                      <span className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-brand/70" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                  {entry.description}
                </p>
              ))}
          </li>
          );
        })}
      </ol>

      {secondary.length > 0 && (
        <div className="mt-12 pl-8">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/40">
            Earlier roles
          </h3>
          <ul className="mt-4 space-y-2.5">
            {secondary.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline gap-x-2 text-sm text-foreground/55"
              >
                <span className="text-foreground/75">{entry.role}</span>
                <span className="text-foreground/30">·</span>
                <span>{entry.org}</span>
                <span className="text-foreground/30">·</span>
                <span className="tabular-nums text-foreground/45">
                  {formatRange(entry)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
