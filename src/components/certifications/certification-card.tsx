"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatMonthYear } from "@/lib/format-date";
import type { Certification } from "@/lib/data/types";

export function CertificationCard({ certification }: { certification: Certification }) {
  const meta = [certification.issuer, formatMonthYear(certification.date)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog>
      <DialogTrigger className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-left transition-colors hover:border-brand/50">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certification.image_url}
            alt={certification.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1 p-6">
          <h3 className="font-heading text-lg font-semibold tracking-tight transition-colors group-hover:text-brand">
            {certification.title}
          </h3>
          {meta && <p className="text-sm text-foreground/60">{meta}</p>}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{certification.title}</DialogTitle>
          {meta && <DialogDescription>{meta}</DialogDescription>}
        </DialogHeader>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={certification.image_url}
          alt={certification.title}
          className="h-auto w-full rounded-lg"
        />

        {certification.description && (
          <p className="text-sm leading-relaxed text-foreground/70">
            {certification.description}
          </p>
        )}

        {certification.credential_url && (
          <a
            href={certification.credential_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand/80"
          >
            <ExternalLink className="h-4 w-4" />
            Verify credential
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
