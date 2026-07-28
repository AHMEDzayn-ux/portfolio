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
const SLIDE_DURATION_MS = 780;
/** Shorter, since a hold already scrolled most of the way before releasing. */
const SETTLE_DURATION_MS = 420;
/** How long the button must stay down before it becomes a continuous scroll
 * rather than a single step. Above a normal click, below a deliberate hold. */
const HOLD_DELAY_MS = 260;
/** Continuous-scroll speed while held, in px per millisecond (~0.7 screens/s
 * on a typical desktop viewport). */
const HOLD_SPEED = 0.85;

// Eased at both ends: an arrow press builds up and settles rather than
// starting at full tilt, which is what made the stepping feel abrupt.
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Snapped horizontal carousel driven entirely by its arrow buttons.
 *
 * An earlier version flowed the track toward the mouse on hover-capable
 * devices, which made the row impossible to hold still: aiming at a card
 * shifted it out from under the cursor. Now the track only moves when you ask
 * it to — arrows, dots, a trackpad swipe, or keyboard focus.
 *
 * The arrows work two ways: a click glides one step with easing at both ends,
 * and holding one down scrolls the row continuously, settling onto the nearest
 * whole slide when released. So a long row is one gesture rather than a dozen
 * clicks.
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
    (to: number, duration = SLIDE_DURATION_MS) => {
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
        const t = Math.min((now - start) / duration, 1);
        viewport.scrollLeft = from + distance * easeInOutCubic(t);
        // Clearing the handle on the last frame matters: `handleScroll` treats
        // a live handle as "a tween owns the offset" and ignores events, so a
        // stale one would deafen it to every later manual scroll.
        animationRef.current = t < 1 ? requestAnimationFrame(tick) : undefined;
      };
      animationRef.current = requestAnimationFrame(tick);
    },
    [reducedMotion]
  );

  const goTo = useCallback(
    (index: number, duration = SLIDE_DURATION_MS) => {
      const m = getMetrics();
      if (!m) return;
      const clamped = Math.min(Math.max(index, 0), m.positions - 1);
      setCurrentIndex(clamped);
      scrollToOffset(Math.min(clamped * m.step, m.max), duration);
    },
    [getMetrics, scrollToOffset]
  );

  // Press-and-hold: after HOLD_DELAY_MS the arrow stops being a stepper and
  // starts dragging the row along at a constant speed, so crossing a long list
  // is one gesture. Releasing settles onto the nearest whole slide.
  const holdRef = useRef<{
    raf?: number;
    timeout?: ReturnType<typeof setTimeout>;
    active: boolean;
    /** Set when a hold ends, and cleared by the trailing click it produced. */
    consumedClick: boolean;
  }>({ active: false, consumedClick: false });

  const stopHold = useCallback(
    (settle: boolean) => {
      const hold = holdRef.current;
      if (hold.timeout) clearTimeout(hold.timeout);
      if (hold.raf) cancelAnimationFrame(hold.raf);
      hold.timeout = undefined;
      hold.raf = undefined;
      if (!hold.active) return;
      hold.active = false;
      hold.consumedClick = true;

      const viewport = viewportRef.current;
      const m = getMetrics();
      if (settle && viewport && m) {
        goTo(Math.round(viewport.scrollLeft / m.step), SETTLE_DURATION_MS);
      }
    },
    [getMetrics, goTo]
  );

  const startHold = useCallback(
    (direction: 1 | -1) => {
      if (reducedMotion) return;
      const hold = holdRef.current;
      hold.timeout = setTimeout(() => {
        hold.active = true;
        // Cancel the click-step tween so the two don't drive scrollLeft at once.
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;

        let last = performance.now();
        const tick = (now: number) => {
          const viewport = viewportRef.current;
          const m = getMetrics();
          if (!viewport || !m) return;
          const dt = now - last;
          last = now;
          const next = viewport.scrollLeft + direction * HOLD_SPEED * dt;
          viewport.scrollLeft = Math.min(Math.max(next, 0), m.max);
          if (viewport.scrollLeft <= 0 || viewport.scrollLeft >= m.max) {
            stopHold(true);
            return;
          }
          hold.raf = requestAnimationFrame(tick);
        };
        hold.raf = requestAnimationFrame(tick);
      }, HOLD_DELAY_MS);
    },
    [getMetrics, reducedMotion, stopHold]
  );

  useEffect(() => () => stopHold(false), [stopHold]);

  // A release that had become a hold already moved the row, and the browser
  // still fires a click on top of it; stepping there would overshoot past what
  // the user just aimed at.
  function handleArrowClick(direction: 1 | -1) {
    if (holdRef.current.consumedClick) {
      holdRef.current.consumedClick = false;
      return;
    }
    goTo(currentIndex + direction);
  }

  // Manual scrolling (trackpad swipe, drag, focus) still owns the index — but
  // not mid-tween, where our own writes would fight the value we just set.
  const handleScroll = useCallback(() => {
    // A hold writes scrollLeft every frame; re-rendering the dots on each of
    // those is pure waste, and stopHold's settle sets the final index anyway.
    if (animationRef.current || holdRef.current.active) return;
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

  // Big enough to aim at without hunting, and dimmed until you go for it so it
  // never competes with the cards it sits over.
  const arrowClass =
    "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/85 opacity-55 shadow-lg backdrop-blur transition-all duration-200 hover:scale-105 hover:border-brand/60 hover:text-brand hover:opacity-100 focus-visible:opacity-100 active:scale-95 disabled:opacity-20 disabled:hover:scale-100 disabled:hover:border-border/60 disabled:hover:text-foreground sm:flex";

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
            onClick={() => handleArrowClick(-1)}
            onPointerDown={() => startHold(-1)}
            onPointerUp={() => stopHold(true)}
            onPointerLeave={() => stopHold(true)}
            onPointerCancel={() => stopHold(true)}
            disabled={atStart}
            className={`${arrowClass} left-1`}
          >
            <ChevronLeft className="h-6 w-6" />
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
            onClick={() => handleArrowClick(1)}
            onPointerDown={() => startHold(1)}
            onPointerUp={() => stopHold(true)}
            onPointerLeave={() => stopHold(true)}
            onPointerCancel={() => stopHold(true)}
            disabled={atEnd}
            className={`${arrowClass} right-1`}
          >
            <ChevronRight className="h-6 w-6" />
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
