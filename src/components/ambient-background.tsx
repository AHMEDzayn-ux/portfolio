"use client";

import { motion } from "framer-motion";
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

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Dot grid — subtle paper-like texture so the background never reads as blank */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.055)_1px,transparent_1px)] [background-size:26px_26px] dark:bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)]" />

      <motion.div
        animate={
          reduced
            ? undefined
            : { x: [0, 70, -50, 0], y: [0, -60, 40, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-[12%] top-[6%] h-[70vmin] w-[95vmin] rounded-full bg-[radial-gradient(ellipse,rgba(96,152,222,0.20),rgba(96,152,222,0.10)_42%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(96,152,222,0.055),rgba(96,152,222,0.03)_45%,transparent_72%)]"
      />
      <motion.div
        animate={
          reduced
            ? undefined
            : { x: [0, -80, 50, 0], y: [0, 50, -40, 0], scale: [1, 0.94, 1.07, 1] }
        }
        transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-14%] top-[38%] h-[64vmin] w-[88vmin] rounded-full bg-[radial-gradient(ellipse,rgba(236,138,62,0.15),rgba(236,138,62,0.07)_42%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(236,138,62,0.04),rgba(236,138,62,0.022)_45%,transparent_72%)]"
      />
      <motion.div
        animate={
          reduced
            ? undefined
            : { x: [0, 60, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.06, 0.95, 1] }
        }
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-18%] left-[22%] h-[70vmin] w-[100vmin] rounded-full bg-[radial-gradient(ellipse,rgba(110,140,228,0.16),rgba(110,140,228,0.08)_42%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(120,160,220,0.045),rgba(120,160,220,0.025)_45%,transparent_72%)]"
      />
    </div>
  );
}
