"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const SECTION_IDS = [
  "about",
  "skills",
  "projects",
  "experience",
  "education",
  "publications",
  "achievements",
  "contact",
];

type Marker = { id: string; top: number };

/**
 * A straight rail along the left edge that fills in sync with page scroll
 * progress, with a dot per section that lights up once the page has
 * scrolled past it — a compact spine tying every section together.
 */
export function ScrollSpine() {
  const fillRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Marker[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    function computeMarkers() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const next = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { id, top: Math.min(100, Math.max(0, (top / docHeight) * 100)) };
      }).filter((m): m is Marker => m !== null);

      markersRef.current = next;
      setMarkers(next);
      ScrollTrigger.refresh();
    }

    computeMarkers();
    window.addEventListener("resize", computeMarkers);
    window.addEventListener("load", computeMarkers);
    return () => {
      window.removeEventListener("resize", computeMarkers);
      window.removeEventListener("load", computeMarkers);
    };
  }, []);

  useGSAP(
    () => {
      if (!fillRef.current) return;

      if (reducedMotion) {
        gsap.set(fillRef.current, { scaleY: 1 });
        setActiveIndex(markersRef.current.length - 1);
        return;
      }

      const tween = gsap.fromTo(
        fillRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            onUpdate: (self) => {
              const progressPct = self.progress * 100;
              const idx = markersRef.current.reduce(
                (acc, m, i) => (progressPct >= m.top ? i : acc),
                -1
              );
              // Only reconcile React when the active dot actually changes —
              // otherwise this fires a re-render on every scroll frame.
              setActiveIndex((prev) => (prev === idx ? prev : idx));
            },
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [reducedMotion] }
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <div className="relative h-[56vh] w-px bg-border/50">
        <div
          ref={fillRef}
          className="absolute inset-x-0 top-0 h-full w-px origin-top scale-y-0 bg-brand"
        />
        {markers.map((m, i) => (
          <span
            key={m.id}
            style={{ top: `${m.top}%` }}
            className={`absolute -left-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full ring-4 ring-background transition-colors duration-300 ${
              i <= activeIndex ? "bg-brand" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
