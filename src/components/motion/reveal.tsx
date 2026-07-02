"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Fades + slides up the direct children of the wrapped element, staggered,
 * as it scrolls into view. Renders content statically (no hidden state) when
 * reduced motion is requested, so nothing is ever permanently invisible.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current) return;
      const targets = gsap.utils.toArray<HTMLElement>(containerRef.current.children);
      if (targets.length === 0) return;

      // Alternate the entrance direction per child (up / left / right) so a
      // multi-item section doesn't feel like one flat slab sliding up.
      // toggleActions replays the entrance every time the section re-enters
      // the viewport (either scroll direction), not just on first visit.
      targets.forEach((el, i) => {
        const dir = i % 3;
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: dir === 0 ? 60 : 30,
            x: dir === 1 ? -64 : dir === 2 ? 64 : 0,
            scale: 0.92,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            delay: i * 0.1,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 82%",
              end: "bottom 15%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  if (Tag === "section") {
    return (
      <section ref={containerRef} className={className}>
        {children}
      </section>
    );
  }
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
