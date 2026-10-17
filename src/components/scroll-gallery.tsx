"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { prefersReducedMotion, subscribeScroll } from "@/lib/scroll-loop";

/**
 * Vertical scroll drives a horizontal track — a pinned "gallery" reveal.
 *
 * Degrades to a plain horizontally-scrollable strip on touch-sized screens
 * and under reduced-motion (see `.gallery-*` in globals.css), so this is
 * enhancement only, never a scroll trap.
 */
export function ScrollGallery({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const maxX = Math.max(0, track.scrollWidth - wrap.clientWidth);
      track.style.transform = `translate3d(${(-progress * maxX).toFixed(2)}px, 0, 0)`;
      wrap.style.setProperty("--gallery-progress", progress.toFixed(4));
    };

    return subscribeScroll(update);
  }, []);

  return (
    <div ref={wrapRef} className={cn("gallery-wrap", className)}>
      <div className="gallery-sticky">
        <div ref={trackRef} className="gallery-track">
          {children}
        </div>
        <div className="gallery-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
