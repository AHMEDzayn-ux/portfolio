"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** How long one arrow-driven move takes. Deliberately unhurried — the point is
 * that you can read the cards as they arrive and land on the one you want. */
const SLIDE_DURATION_MS = 700;

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Snapped horizontal carousel driven entirely by its arrow buttons.
 *
 * An earlier version flowed the track toward the mouse on hover-capable
 * devices, which made the row impossible to hold still: aiming at a card
 * shifted it out from under the cursor. Now the track is a plain scroll-snap
 * viewport — it only moves when you ask it to, via the arrows, the dots, a
 * trackpad swipe, or keyboard focus — and each arrow press tweens exactly one
 * step over ~0.7s so nothing whips past.
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

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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
  }, [getMetrics, slides.length]);

  // Hand-rolled tween instead of scrollTo({ behavior: "smooth" }): the native
  // easing is browser-defined and lands faster than reads comfortably here.
  const animationRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const scrollToOffset = useCallback(
    (to: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      animationRef.current = undefined;
      const from = viewport.scrollLeft;
      const distance = to - from;
      if (reducedMotion || Math.abs(distance) < 1) {
        viewport.scrollLeft = to;
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / SLIDE_DURATION_MS, 1);
        viewport.scrollLeft = from + distance * easeOutQuart(t);
        // Clearing the handle on the last frame matters: `handleScroll` treats
        // a live handle as "a tween owns the offset" and ignores events, so a
        // stale one would deafen it to every later manual scroll.
        animationRef.current = t < 1 ? requestAnimationFrame(tick) : undefined;
      };
      animationRef.current = requestAnimationFrame(tick);
    },
    [reducedMotion]
  );

  function goTo(index: number) {
    const m = getMetrics();
    if (!m) return;
    const clamped = Math.min(Math.max(index, 0), m.positions - 1);
    setCurrentIndex(clamped);
    scrollToOffset(Math.min(clamped * m.step, m.max));
  }

  // Manual scrolling (trackpad swipe, drag, focus) still owns the index — but
  // not mid-tween, where our own writes would fight the value we just set.
  const handleScroll = useCallback(() => {
    if (animationRef.current) return;
    const viewport = viewportRef.current;
    const m = getMetrics();
    if (!viewport || !m) return;
    setCurrentIndex(
      Math.min(Math.round(viewport.scrollLeft / m.step), m.positions - 1)
    );
  }, [getMetrics]);

  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= positions - 1;

  useGSAP(
    () => {
      if (reducedMotion || !trackRef.current) return;
      const cards = gsap.utils.toArray<HTMLElement>(trackRef.current.children);
      if (cards.length === 0) return;

      // Cards rise in one by one from below as the carousel enters view, and
      // replay every time it re-enters the viewport (either scroll direction).
      gsap.fromTo(
        cards,
        { opacity: 0, y: 70, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: viewportRef.current,
            start: "top 88%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: viewportRef, dependencies: [reducedMotion, slides.length] }
  );

  const arrowClass =
    "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/50 bg-background/80 p-2 backdrop-blur transition-all hover:border-brand/60 hover:text-brand disabled:opacity-25 disabled:hover:border-border/50 disabled:hover:text-foreground sm:flex";

  return (
    <div className={className}>
      {/* -my-24/py-24 gives the lifted cards room to breathe without clipping,
          while overflow-clip stops that transform bleed from leaking into the
          page's own scrollable area (it was triggering a spurious vertical
          scrollbar). overflow-clip (rather than hidden) guarantees this box can
          never itself become a scroll container. Negative margin cancels the
          padding's layout impact, so surrounding spacing is unchanged. */}
      <div className="relative -my-24 overflow-clip py-24">
        {positions > 1 && (
          <button
            type="button"
            aria-label={`Previous ${ariaLabel}`}
            onClick={() => goTo(currentIndex - 1)}
            disabled={atStart}
            className={`${arrowClass} left-1`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          ref={viewportRef}
          onScroll={handleScroll}
          className="snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div ref={trackRef} className="flex gap-6 py-4">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`shrink-0 snap-start snap-always ${slideClassName}`}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>

        {positions > 1 && (
          <button
            type="button"
            aria-label={`Next ${ariaLabel}`}
            onClick={() => goTo(currentIndex + 1)}
            disabled={atEnd}
            className={`${arrowClass} right-1`}
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
