"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Snapped horizontal carousel. On hover-capable devices the track follows the
 * mouse: moving right flows the row right — the target is quantized to whole
 * slide steps and eased by a spring, so it always comes to rest with slides
 * fully visible, never cut in half. Touch and reduced-motion users get native
 * mandatory scroll snapping with arrow buttons. Dots below in both modes.
 */
export function FlowCarousel({
  children,
  className,
  slideClassName,
  ariaLabel = "carousel",
}: {
  children: React.ReactNode;
  className?: string;
  slideClassName: string;
  ariaLabel?: string;
}) {
  const slides = Children.toArray(children);
  const reducedMotion = useReducedMotion();
  const [hoverCapable, setHoverCapable] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setHoverCapable(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setHoverCapable(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const pointerFlow = hoverCapable && !reducedMotion;

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 90, damping: 22, mass: 0.7 });
  const [currentIndex, setCurrentIndex] = useState(0);

  // step = distance between slide starts; positions = how many snapped stops
  // exist (last stop shows the final full view, no dangling half slide).
  const getMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || track.children.length === 0) return null;
    const els = track.children;
    const step =
      els.length > 1
        ? (els[1] as HTMLElement).offsetLeft - (els[0] as HTMLElement).offsetLeft
        : (els[0] as HTMLElement).clientWidth;
    const max = Math.max(track.scrollWidth - viewport.clientWidth, 0);
    if (step <= 0) return null;
    const positions = Math.round(max / step) + 1;
    return { step, max, positions };
  }, []);

  const [positions, setPositions] = useState(1);
  useEffect(() => {
    const measure = () => setPositions(getMetrics()?.positions ?? 1);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [getMetrics, slides.length, pointerFlow]);

  function handleMove(e: ReactPointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const m = getMetrics();
    if (!viewport || !m || m.max <= 0) return;
    const r = viewport.getBoundingClientRect();
    const ratio = (e.clientX - r.left) / r.width;
    // Dead margins at the edges, then quantize to whole slide steps so the
    // spring always settles on a fully visible slide.
    const t = Math.min(1, Math.max(0, (ratio - 0.08) / 0.84));
    const index = Math.round(t * (m.positions - 1));
    setCurrentIndex(index);
    x.set(-Math.min(index * m.step, m.max));
  }

  function goTo(index: number) {
    const m = getMetrics();
    if (!m) return;
    const clamped = Math.min(Math.max(index, 0), m.positions - 1);
    setCurrentIndex(clamped);
    if (pointerFlow) {
      x.set(-Math.min(clamped * m.step, m.max));
    } else {
      viewportRef.current?.scrollTo({
        left: Math.min(clamped * m.step, m.max),
        behavior: "smooth",
      });
    }
  }

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    const m = getMetrics();
    if (!viewport || !m) return;
    setCurrentIndex(
      Math.min(Math.round(viewport.scrollLeft / m.step), m.positions - 1)
    );
  }, [getMetrics]);

  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= positions - 1;

  return (
    <div className={className}>
      <div className="relative">
        {!pointerFlow && (
          <button
            type="button"
            aria-label={`Previous ${ariaLabel}`}
            onClick={() => goTo(currentIndex - 1)}
            disabled={atStart}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border/50 bg-background/80 p-2 backdrop-blur transition-all hover:border-brand/60 hover:text-brand disabled:opacity-30 disabled:hover:border-border/50 disabled:hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          ref={viewportRef}
          onPointerMove={pointerFlow ? handleMove : undefined}
          onScroll={!pointerFlow ? handleScroll : undefined}
          className={
            pointerFlow
              ? "overflow-hidden"
              : "snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          }
        >
          <motion.div
            ref={trackRef}
            style={pointerFlow ? { x: springX } : undefined}
            className="flex gap-6"
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`shrink-0 snap-start snap-always ${slideClassName}`}
              >
                {slide}
              </div>
            ))}
          </motion.div>
        </div>

        {!pointerFlow && (
          <button
            type="button"
            aria-label={`Next ${ariaLabel}`}
            onClick={() => goTo(currentIndex + 1)}
            disabled={atEnd}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border/50 bg-background/80 p-2 backdrop-blur transition-all hover:border-brand/60 hover:text-brand disabled:opacity-30 disabled:hover:border-border/50 disabled:hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {positions > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: positions }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to position ${index + 1}`}
              aria-current={index === currentIndex}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-brand"
                  : "w-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
