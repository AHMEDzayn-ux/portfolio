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

      gsap.set(targets, { opacity: 0, y: 32 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 82%",
        },
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
