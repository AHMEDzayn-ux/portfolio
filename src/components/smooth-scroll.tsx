"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { setLenisInstance } from "@/lib/lenis-instance";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll() {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (reducedMotion || isAdmin) return;

    const lenis = new Lenis({
      autoRaf: false,
    });
    setLenisInstance(lenis);

    // Drive ScrollTrigger off Lenis's smoothed scroll position so every
    // scroll-linked animation (Reveal, ScrollSpine, hero parallax) reads the
    // exact same value Lenis is applying — this removes the one-frame lag
    // that's most obvious on mobile.
    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      // gsap.ticker reports time in seconds; Lenis expects milliseconds
      // (same units as requestAnimationFrame's timestamp).
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, [reducedMotion, isAdmin]);

  return null;
}
