"use client";

import { useSyncExternalStore } from "react";

// Small/coarse-pointer devices use the lightweight motion path too. Mobile
// browsers already do extra work while their dynamic viewport and browser
// chrome move, so skipping smooth-scroll interpolation, scrubbed timelines,
// fixed background drift, and pointer parallax keeps native scrolling fluid.
const QUERY =
  "(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
