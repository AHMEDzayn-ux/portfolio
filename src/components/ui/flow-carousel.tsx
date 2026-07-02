"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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

  // Cards only enlarge while the row is actively flowing — idles back to
  // flat the moment the pointer stops moving, so the resting layout never
  // looks like the center card is wedged into its neighbors.
  const flowIntensity = useMotionValue(0);
  const smoothFlowIntensity = useSpring(flowIntensity, {
    stiffness: 170,
    damping: 26,
  });
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function markFlowing() {
    flowIntensity.set(1);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => flowIntensity.set(0), 220);
  }

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
  const stepRef = useRef(1);
  useEffect(() => {
    const measure = () => {
      const m = getMetrics();
      setPositions(m?.positions ?? 1);
      stepRef.current = m?.step ?? 1;
    };
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
    markFlowing();
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
              <FlowSlide
                key={index}
                index={index}
                springX={springX}
                flowIntensity={smoothFlowIntensity}
                pointerFlow={pointerFlow}
                stepRef={stepRef}
                className={`shrink-0 snap-start snap-always ${slideClassName}`}
              >
                {slide}
              </FlowSlide>
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

/** A single carousel slide that zooms up slightly as it flows toward center. */
function FlowSlide({
  children,
  index,
  springX,
  flowIntensity,
  pointerFlow,
  stepRef,
  className,
}: {
  children: React.ReactNode;
  index: number;
  springX: MotionValue<number>;
  flowIntensity: MotionValue<number>;
  pointerFlow: boolean;
  stepRef: React.RefObject<number>;
  className?: string;
}) {
  const spread = 1.6; // how many slide-steps the influence reaches

  function proximityEase(v: number) {
    const step = stepRef.current || 1;
    const t = -v / step;
    const distance = Math.min(Math.abs(index - t), spread);
    // Smooth cosine falloff (0 at center → 1 at edge of influence) so
    // neighboring cards ease in/out gently, like beads riding a curve.
    return (1 - Math.cos((distance / spread) * Math.PI)) / 2;
  }

  const scale = useTransform([springX, flowIntensity], (latest) => {
    if (!pointerFlow) return 1;
    const [v, intensity] = latest as [number, number];
    const eased = proximityEase(v);
    const flowingScale = 1.16 - eased * 0.24;
    return 1 + (flowingScale - 1) * intensity;
  });
  const y = useTransform([springX, flowIntensity], (latest) => {
    if (!pointerFlow) return 0;
    const [v, intensity] = latest as [number, number];
    const eased = proximityEase(v);
    return eased * 10 * intensity;
  });

  return (
    <motion.div style={{ scale, y }} className={className}>
      {children}
    </motion.div>
  );
}
