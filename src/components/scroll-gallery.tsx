"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { clamp, prefersReducedMotion, subscribeScroll } from "@/lib/scroll-loop";

/**
 * Vertical scroll drives a horizontal track — a pinned "gallery" reveal.
 *
 * The track *eases* toward the scroll position instead of snapping to it, so
 * the strip carries some weight as it settles. Every card is also handed
 * `--gallery-focus` (-1 at the left edge of the lane, 0 dead centre, 1 at the
 * right) plus `--gallery-focus-abs`, which is what lets the CSS fan the cards
 * into depth, and `--gallery-progress` / `--gallery-x` are written on the
 * wrapper so a `stage` behind the track can be lit and driven by the same
 * scroll.
 *
 * Degrades to a plain horizontally-scrollable strip on touch-sized screens
 * and under reduced-motion (see `.gallery-*` in globals.css), so this is
 * enhancement only, never a scroll trap.
 */
export function ScrollGallery({
  children,
  className,
  stage,
}: {
  children: ReactNode;
  className?: string;
  /** Decorative scenery pinned behind the track. Reads the gallery vars. */
  stage?: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    // Item centres in the wrapper's own coordinate space, measured from
    // layout (offsets ignore transforms) rather than from rects, so the
    // writes below never invalidate the read. Re-measured every tick: seven
    // offsets is cheaper than a forced reflow.
    let centres: number[] = [];
    const measure = () => {
      const base = track.offsetLeft;
      centres = Array.from(track.children, (node) => {
        const el = node as HTMLElement;
        return el.offsetLeft - base + el.offsetWidth / 2;
      });
    };

    const write = (progress: number) => {
      const maxX = Math.max(0, track.scrollWidth - wrap.clientWidth);
      const x = -progress * maxX;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      wrap.style.setProperty("--gallery-progress", progress.toFixed(4));
      wrap.style.setProperty("--gallery-x", `${x.toFixed(1)}px`);

      const middle = wrap.clientWidth / 2;
      const lane = Math.max(1, wrap.clientWidth * 0.55);
      for (let i = 0; i < centres.length; i++) {
        const el = track.children[i] as HTMLElement | undefined;
        if (!el || centres[i] === undefined) continue;
        const focus = clamp((centres[i] + x - middle) / lane, -1, 1);
        el.style.setProperty("--gallery-focus", focus.toFixed(4));
        el.style.setProperty("--gallery-focus-abs", Math.abs(focus).toFixed(4));
      }
    };

    // Damped follow. The exponential decay is frame-rate independent, so the
    // feel is the same on a 60Hz and a 144Hz display.
    let target = 0;
    let current = 0;
    let raf = 0;
    let last = 0;

    const settle = (now: number) => {
      const dt = Math.min(64, Math.max(8, now - last));
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / 105));
      if (Math.abs(target - current) < 0.0005) {
        current = target;
        raf = 0;
      } else {
        raf = requestAnimationFrame(settle);
      }
      write(current);
    };

    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) return;

      // Clamped, so an off-screen gallery is already parked at its start or
      // end by the time it arrives in the viewport.
      target = clamp(-rect.top / scrollable, 0, 1);
      measure();
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(settle);
      }
    };

    return subscribeScroll(update);
  }, []);

  return (
    <div ref={wrapRef} className={cn("gallery-wrap", className)}>
      <div className="gallery-sticky">
        {stage ? <div className="gallery-stage">{stage}</div> : null}
        <div ref={trackRef} className="gallery-track">
          {children}
        </div>
        <div className="gallery-progress" aria-hidden="true">
          <span className="gallery-progress-fill" />
          <span className="gallery-progress-knob" />
        </div>
      </div>
    </div>
  );
}
