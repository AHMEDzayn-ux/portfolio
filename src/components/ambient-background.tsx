"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Ambient page background: a faint dot grid for texture plus three slow-
 * drifting glows echoing the hero's cool-blue / warm-amber palette. Fixed
 * behind all content (the hero is opaque, so this only shows through the
 * lighter sections). Glows are stronger in light mode (they barely register
 * over white otherwise) and very soft-centered in dark mode. Static under
 * prefers-reduced-motion.
 */
export function AmbientBackground() {
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(-999);
  const pointerY = useMotionValue(-999);
  const glowX = useSpring(pointerX, { stiffness: 75, damping: 24, mass: 0.5 });
  const glowY = useSpring(pointerY, { stiffness: 75, damping: 24, mass: 0.5 });
  const dotGlowMask = useMotionTemplate`radial-gradient(circle 13rem at ${glowX}px ${glowY}px, black 0%, rgba(0,0,0,0.78) 34%, transparent 72%)`;
  const [hasPointer, setHasPointer] = useState(false);
  const pointerSeenRef = useRef(false);

  useEffect(() => {
    if (reduced) return;

    function handlePointerMove(e: PointerEvent) {
      if (!pointerSeenRef.current) {
        pointerSeenRef.current = true;
        setHasPointer(true);
      }
      pointerX.set(e.clientX);
      pointerY.set(e.clientY);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [pointerX, pointerY, reduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Dot grid — subtle paper-like texture so the background never reads as blank */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.09)_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)]" />

      <motion.div
        style={{
          opacity: reduced || !hasPointer ? 0 : 1,
          WebkitMaskImage: dotGlowMask,
          maskImage: dotGlowMask,
        }}
        className="absolute inset-0 bg-[radial-gradient(rgba(96,152,222,0.34)_1px,transparent_1px),radial-gradient(rgba(236,138,62,0.22)_1px,transparent_1px)] [background-position:0_0,12px_12px] [background-size:24px_24px] transition-opacity duration-300 dark:bg-[radial-gradient(rgba(96,152,222,0.11)_1px,transparent_1px),radial-gradient(rgba(236,138,62,0.08)_1px,transparent_1px)]"
      />

      <motion.div
        animate={
          reduced
            ? undefined
            : { x: [0, 70, -50, 0], y: [0, -60, 40, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-[12%] top-[6%] h-[70vmin] w-[95vmin] rounded-full bg-[radial-gradient(ellipse,rgba(96,152,222,0.17),rgba(96,152,222,0.08)_35%,rgba(96,152,222,0.025)_60%,transparent_88%)] dark:bg-[radial-gradient(ellipse,rgba(96,152,222,0.045),rgba(96,152,222,0.022)_35%,rgba(96,152,222,0.008)_60%,transparent_88%)]"
      />
      <motion.div
        animate={
          reduced
            ? undefined
            : { x: [0, -80, 50, 0], y: [0, 50, -40, 0], scale: [1, 0.94, 1.07, 1] }
        }
        transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-14%] top-[38%] h-[64vmin] w-[88vmin] rounded-full bg-[radial-gradient(ellipse,rgba(236,138,62,0.13),rgba(236,138,62,0.06)_35%,rgba(236,138,62,0.02)_60%,transparent_88%)] dark:bg-[radial-gradient(ellipse,rgba(236,138,62,0.032),rgba(236,138,62,0.016)_35%,rgba(236,138,62,0.006)_60%,transparent_88%)]"
      />
      <motion.div
        animate={
          reduced
            ? undefined
            : { x: [0, 60, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.06, 0.95, 1] }
        }
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-18%] left-[22%] h-[70vmin] w-[100vmin] rounded-full bg-[radial-gradient(ellipse,rgba(110,140,228,0.14),rgba(110,140,228,0.07)_35%,rgba(110,140,228,0.022)_60%,transparent_88%)] dark:bg-[radial-gradient(ellipse,rgba(120,160,220,0.036),rgba(120,160,220,0.018)_35%,rgba(120,160,220,0.007)_60%,transparent_88%)]"
      />
    </div>
  );
}
