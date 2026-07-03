"use client";

import { Play } from "lucide-react";
import { FlowCarousel } from "@/components/ui/flow-carousel";
import type { ProjectMedia } from "@/lib/data/types";

/**
 * Project-page gallery carousel: same mouse-follow flow, snapping, and dots
 * as the home-page projects carousel. Two slides per view on desktop, one on
 * mobile. Videos render with native controls.
 */
export function MediaCarousel({
  media,
  className,
}: {
  media: ProjectMedia[];
  className?: string;
}) {
  if (media.length === 0) return null;

  return (
    <FlowCarousel
      className={className}
      ariaLabel="gallery"
      slideClassName="w-full sm:w-[calc((100%-1.5rem)/2)]"
      flowStiffness={14}
      flowDamping={18}
      flowMass={1.6}
    >
      {media.map((item) => (
        <figure
          key={item.url}
          className="group relative aspect-video overflow-hidden rounded-2xl border border-border/60 bg-secondary/30"
        >
          {item.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <>
              <video
                src={item.url}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
              <Play className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-white/70 drop-shadow" />
            </>
          )}
        </figure>
      ))}
    </FlowCarousel>
  );
}
