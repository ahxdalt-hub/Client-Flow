"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";
import { hasFinePointer, prefersReducedMotion, subscribeScroll } from "@/lib/scroll-loop";

/* ────────────────────────────────────────────────────────────────
   Motion system
   Every primitive degrades gracefully: content is visible in the
   initial HTML and only hidden/animated once JS has attached
   (CSS scopes to `html.js`). Nothing is ever invisible without JS.
   ──────────────────────────────────────────────────────────────── */

type RevealVariant = "up" | "fade" | "scale" | "blur" | "left" | "right";

/**
 * Scroll-triggered reveal. Content is fully visible in the initial HTML;
 * hiding only begins once JS has attached (CSS scopes to `html.js`),
 * so if JavaScript fails, nothing is ever invisible.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  as: Tag = "div",
  className,
  once = true,
  variant = "up",
  duration,
}: {
  children: ReactNode;
  /** stagger delay in ms */
  delay?: number;
  /** starting translateY in px (used by the "up" variant) */
  y?: number;
  as?: ElementType;
  className?: string;
  once?: boolean;
  variant?: RevealVariant;
  /** override transition duration in ms */
  duration?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("revealed");
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.classList.remove("revealed");
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-reveal-variant={variant}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-y": `${y}px`,
          ...(duration ? { "--reveal-duration": `${duration}ms` } : null),
        } as CSSProperties
      }
      className={className}
    >
      {children}
    </Tag>
  );
}

/**
 * Vertical parallax. Tracks the element's position in the viewport and
 * writes a -1..1 progress into `--parallax`, translated by `speed` px.
 * Pointer/scroll work is shared through the scroll loop and skipped
 * entirely under reduced-motion.
 */
export function Parallax({
  children,
  speed = 40,
  className,
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  /** peak translation in px (element drifts ±speed across the viewport) */
  speed?: number;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const centre = rect.top + rect.height / 2;
      const span = vh / 2 + rect.height / 2 || 1;
      // -1 just below the fold → 0 centred → 1 just above
      const progress = Math.max(-1, Math.min(1, (vh / 2 - centre) / span));
      el.style.setProperty("--parallax", progress.toFixed(4));
    };

    return subscribeScroll(update);
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("parallax", className)}
      style={
        {
          "--parallax-speed": `${speed}px`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

/** Thin progress bar pinned under the header. Fills as the page scrolls. */
export function ScrollProgress({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;
      el.style.setProperty("--progress", Math.max(0, Math.min(1, progress)).toFixed(4));
    };
    return subscribeScroll(update);
  }, []);

  return <div ref={ref} aria-hidden="true" className={cn("scroll-progress", className)} />;
}

/**
 * Number that counts up when scrolled into view. Renders the final value
 * on the server so there is no layout shift and no empty state.
 */
export function Counter({
  to,
  from = 0,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const format = useMemo(
    () => (value: number) => `${prefix}${value.toFixed(decimals)}${suffix}`,
    [prefix, suffix, decimals],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = format(to);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = format(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
        else el.textContent = format(to);
      };
      raf = requestAnimationFrame(tick);
    };

    el.textContent = format(from);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            run();
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration, format]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {format(to)}
    </span>
  );
}

/** Pointer-following magnet. Fine-pointer devices only; no-op on touch. */
export function Magnetic({
  children,
  className,
  strength = 0.28,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      raf = 0;
      el.style.transform = tx === 0 && ty === 0 ? "" : `translate3d(${tx}px, ${ty}px, 0)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      tx = (event.clientX - (rect.left + rect.width / 2)) * strength;
      ty = (event.clientY - (rect.top + rect.height / 2)) * strength;
      schedule();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      schedule();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <Tag ref={ref} className={cn("magnetic", className)}>
      {children}
    </Tag>
  );
}

/** 3D tilt toward the pointer. Subtle, capped, and disabled on touch. */
export function Tilt({
  children,
  className,
  max = 6,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  max?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return;

    let raf = 0;
    let rx = 0;
    let ry = 0;

    const apply = () => {
      raf = 0;
      el.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      ry = px * max * 2;
      rx = -py * max * 2;
      schedule();
    };
    const onLeave = () => {
      rx = 0;
      ry = 0;
      schedule();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [max]);

  return (
    <Tag ref={ref} className={cn("tilt", className)}>
      {children}
    </Tag>
  );
}

/** Card wrapper that casts a soft accent spotlight under the pointer. */
export function Spotlight({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer()) return;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Tag ref={ref} className={cn("spotlight", className)}>
      {children}
    </Tag>
  );
}

/**
 * Word-by-word masked reveal for display headings. Spaces are preserved and
 * the words stay in the accessibility tree as normal text.
 */
export function Words({
  text,
  className,
  delay = 0,
  step = 55,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="word">
          <span className="word-inner" style={{ animationDelay: `${delay + i * step}ms` }}>
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/** Reveal-on-view wrapper that staggers its direct children automatically. */
export function Stagger({
  children,
  className,
  step = 70,
  base = 0,
  y = 18,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** ms between each child */
  step?: number;
  /** ms before the first child */
  base?: number;
  y?: number;
  as?: ElementType;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <Tag className={className}>
      {items.map((child, i) => (
        <Reveal key={i} delay={base + i * step} y={y}>
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}

/**
 * Reads scroll progress of the whole page as a 0..1 value, re-rendering only
 * when it changes enough to matter. Handy for headers and one-off effects.
 */
export function useScrollProgress(threshold = 0.001): number {
  const [progress, setProgress] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const next = max > 0 ? doc.scrollTop / max : 0;
      if (Math.abs(next - last.current) >= threshold) {
        last.current = next;
        setProgress(next);
      }
    };
    return subscribeScroll(update);
  }, [threshold]);

  return progress;
}

/** True once the page has scrolled past `offset` px. */
export function useScrolledPast(offset = 8): boolean {
  const [past, setPast] = useState(false);
  const current = useRef(false);

  useEffect(() => {
    const update = () => {
      const next = window.scrollY > offset;
      if (next !== current.current) {
        current.current = next;
        setPast(next);
      }
    };
    return subscribeScroll(update);
  }, [offset]);

  return past;
}
