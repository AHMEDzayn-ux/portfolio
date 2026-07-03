"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { setLenisInstance } from "@/lib/lenis-instance";

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

    function raf(time: number) {
      // gsap.ticker reports time in seconds; Lenis expects milliseconds
      // (same units as requestAnimationFrame's timestamp).
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, [reducedMotion, isAdmin]);

  return null;
}
