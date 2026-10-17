"use client";

/**
 * One passive scroll/resize listener shared by every motion primitive.
 *
 * Instead of attaching a listener per element, primitives subscribe here and
 * read their own geometry once per animation frame. That keeps scroll work
 * O(elements) on a single rAF tick rather than N competing listeners — which
 * is what usually makes "scroll effects" feel janky.
 *
 * Client-only: never imported from a server component directly.
 */

type ScrollCallback = () => void;

const subscribers = new Set<ScrollCallback>();
let attached = false;
let ticking = false;

function flush() {
  ticking = false;
  // Copy first: a callback may unsubscribe itself mid-flush.
  for (const cb of Array.from(subscribers)) cb();
}

function schedule() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(flush);
}

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
}

/** Subscribe to rAF-throttled scroll/resize ticks. Runs immediately once. */
export function subscribeScroll(cb: ScrollCallback): () => void {
  attach();
  subscribers.add(cb);
  cb();
  return () => {
    subscribers.delete(cb);
  };
}

/** True when the user has asked the OS to minimise animation. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True for devices with a precise pointer (mouse/trackpad, not touch). */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/** Clamp a number into a range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
