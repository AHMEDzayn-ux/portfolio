"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import { HazeCanvas } from "@/components/hero/haze-canvas";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { Profile } from "@/lib/data/types";

// Text arrives last: fade-up + blur-to-focus, staggered line by line.
const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 1.7 } },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(14px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

const reducedTextContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const reducedTextItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

/**
 * Cinematic hero: a full-height portrait emerging through thin layered haze.
 * Depth comes entirely from independent motion — pointer parallax (portrait
 * moves most, glows least, haze layers each on their own depth inside the
 * shader), a slow breathing zoom, and scroll parallax where every layer lags
 * the page at its own rate.
 */
export function Hero({ profile }: { profile: Profile }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const portraitImgRef = useRef<HTMLImageElement | null>(null);

  // Pointer parallax — normalized -0.5..0.5, smoothed.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 19 });
  const sy = useSpring(my, { stiffness: 40, damping: 19 });

  // Foreground (portrait) shifts most, background glows barely and opposite.
  const portraitX = useTransform(sx, [-0.5, 0.5], [-11, 11]);
  const portraitY = useTransform(sy, [-0.5, 0.5], [-7, 7]);
  const glowX = useTransform(sx, [-0.5, 0.5], [4, -4]);
  const glowY = useTransform(sy, [-0.5, 0.5], [3, -3]);

  // Scroll parallax — the hero lags the page, each layer at its own rate.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const glowScrollY = useTransform(scrollYProgress, [0, 1], ["0svh", "34svh"]);
  const hazeScrollY = useTransform(scrollYProgress, [0, 1], ["0svh", "24svh"]);
  const portraitScrollY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0svh", "15svh"],
  );
  const textScrollY = useTransform(scrollYProgress, [0, 1], ["0svh", "8svh"]);

  function handleMove(e: ReactPointerEvent<HTMLElement>) {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="hero"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="relative h-[100svh] w-full overflow-hidden bg-black text-white"
      >
        {/* Background glows — deepest layer */}
        <motion.div
          style={reduced ? undefined : { y: glowScrollY }}
          className="pointer-events-none absolute inset-0 z-10"
        >
          <motion.div
            style={reduced ? undefined : { x: glowX, y: glowY }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.2, delay: 0.45, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute left-1/2 top-1/2 h-[95vh] w-[120vw] max-h-[980px] max-w-[1800px] -translate-x-[62%] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(96,152,222,0.44),rgba(96,152,222,0.22)_44%,transparent_78%)] blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-[86vh] w-[112vw] max-h-[900px] max-w-[1700px] -translate-x-[38%] -translate-y-[46%] rounded-full bg-[radial-gradient(ellipse,rgba(236,138,62,0.4),rgba(236,138,62,0.2)_44%,transparent_78%)] blur-3xl" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Portrait — full height, bottom-anchored, revealed first */}
        <motion.div
          style={reduced ? undefined : { y: portraitScrollY }}
          className="absolute inset-0 z-20"
        >
          <motion.div
            style={reduced ? undefined : { x: portraitX, y: portraitY }}
            className="absolute inset-0"
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.055 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {profile.avatar_url && (
                <div className="absolute bottom-[3svh] right-0 h-[84svh] sm:right-[2%] lg:right-[4%]">
                  {/* Breathing zoom — ~2% over 11s, its own wrapper so it never
                    fights the intro scale settle above */}
                  <motion.div
                    animate={reduced ? undefined : { scale: [1, 1.022, 1] }}
                    transition={{
                      duration: 11,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={portraitImgRef}
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="h-full w-auto max-w-[94vw] object-contain object-bottom"
                      style={{
                        filter:
                          "contrast(1.06) saturate(0.94) brightness(0.98)",
                      }}
                    />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Vignette above the portrait — darkens the cropped edges into black */}
        <div className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.9)_100%)]" />

        {/* Layered haze — rendered between the glows and the portrait so the
          smoke can never overlay the photo or the text */}
        <motion.div
          style={reduced ? undefined : { y: hazeScrollY }}
          className="pointer-events-none absolute inset-0 z-[15]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.7, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <HazeCanvas
              portraitUrl={profile.avatar_url}
              portraitRef={portraitImgRef}
              pointerX={sx}
              pointerY={sy}
            />
          </motion.div>
        </motion.div>

        {/* Legibility gradient under the text + blend into the next section */}
        <div className="pointer-events-none absolute inset-0 z-40 bg-gradient-to-t from-black/85 via-transparent to-black/25" />
        {/* Glossy frosted band — progressively blurs (not hides) the photo's
          bottom so it dissolves smoothly into the next section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-36 backdrop-blur-md"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 85%)",
            maskImage: "linear-gradient(to bottom, transparent, black 85%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-b from-transparent to-black" />

        {/* Text */}
        <motion.div
          style={reduced ? undefined : { y: textScrollY }}
          className="absolute inset-x-0 bottom-0 z-50"
        >
          <motion.div
            variants={reduced ? reducedTextContainer : textContainer}
            initial="hidden"
            animate="show"
            className="mx-auto w-full max-w-6xl px-6 pb-24"
          >
            <motion.p
              variants={reduced ? reducedTextItem : textItem}
              className="text-sm font-medium uppercase tracking-[0.35em] text-brand sm:text-base"
            >
              {profile.title}
            </motion.p>
            <motion.h1
              variants={reduced ? reducedTextItem : textItem}
              className="mt-5 max-w-3xl font-heading text-7xl font-semibold leading-[1.02] tracking-tight sm:text-8xl lg:text-9xl"
            >
              {profile.full_name.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </motion.h1>
            <motion.p
              variants={reduced ? reducedTextItem : textItem}
              className="mt-6 max-w-xl text-balance text-lg text-white/70 sm:text-xl"
            >
              {profile.short_tagline}
            </motion.p>
            <motion.div
              variants={reduced ? reducedTextItem : textItem}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a
                href="#projects"
                className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.03]"
              >
                View my work
              </a>
              {profile.resume_url && (
                <a
                  href="/api/resume"
                  download
                  className="flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-brand/70 hover:text-white"
                >
                  <Download className="h-4 w-4" />
                  Resume
                </a>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.a
          href="#about"
          aria-label="Scroll to about section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.9, duration: 1.2, ease: "easeOut" }}
          className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <motion.span
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-white/72 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
          >
            <span className="font-sans">Scroll</span>
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.9} />
          </motion.span>
        </motion.a>
      </section>
    </>
  );
}
