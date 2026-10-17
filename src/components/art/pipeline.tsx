"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { clamp, prefersReducedMotion, subscribeScroll } from "@/lib/scroll-loop";

/**
 * The five-stage route, drawn as a rail that fills with the scroll.
 *
 * The fill is not a one-shot reveal: the section's own progress through
 * the viewport (0 → 1) is written onto the root as `--pipeline`, eased
 * with the same frame-rate-independent damping the gallery uses, so the
 * rail carries weight as it advances and eases back when you scroll up.
 * Each node reads that variable against its own `--at` offset and lights
 * as the fill arrives, and a packet loops along the rail so the route
 * still reads as live once it has parked at 1.
 *
 * With JavaScript off, `--pipeline` falls back to 1 in CSS: the whole
 * route is simply drawn, complete and readable.
 */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const STAGES: { step: string; title: string; text: string; icon: ReactNode }[] = [
  {
    step: "01",
    title: "Research",
    text: "Pick one niche, list fifteen businesses from public sources.",
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "First touch",
    text: "One specific observation, one clear, small ask.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Follow up",
    text: "Four scheduled nudges — timed, worded, never guesswork.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 8v4l3 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Proposal",
    text: "Ten fixed sections: scope, milestones, revisions, exclusions.",
    icon: (
      <svg {...iconProps}>
        <path d="M6 2h9l5 5v15H6z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Signed",
    text: "The tracker flips to won. The sequence starts again.",
    icon: (
      <svg {...iconProps}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
];

/** Index of the final stage — the divisor that spreads `--at` over the rail. */
const LAST = STAGES.length - 1;

export function Pipeline() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty("--pipeline", "1");
      return;
    }

    let target = 0;
    let current = 0;
    let raf = 0;
    let last = 0;

    const settle = (now: number) => {
      const dt = Math.min(64, Math.max(8, now - last));
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / 95));
      if (Math.abs(target - current) < 0.0005) {
        current = target;
        raf = 0;
      } else {
        raf = requestAnimationFrame(settle);
      }
      el.style.setProperty("--pipeline", clamp(current, 0, 1).toFixed(4));
    };

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Starts filling once the rail is a fifth up from the fold and
      // finishes around the upper third, so the whole route resolves
      // while it is comfortably on screen — tall and short layouts alike.
      const start = vh * 0.85;
      const span = Math.max(1, vh * 0.55 + rect.height * 0.5);
      target = clamp((start - rect.top) / span, 0, 1);
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(settle);
      }
    };

    return subscribeScroll(update);
  }, []);

  return (
    <Reveal y={26} once>
      <div ref={ref} className="pipeline">
        <div className="pipeline-rail" aria-hidden="true">
          <span className="pipeline-rail-fill" />
          <span className="pipeline-rail-packet" />
        </div>

        <ol className="pipeline-track">
          {STAGES.map((stage, i) => (
            <li
              key={stage.step}
              className="pipeline-stage"
              style={
                {
                  // Lights at 0, .22, .44, .66, .88 of the rail.
                  "--at": ((i / LAST) * 0.88).toFixed(3),
                } as CSSProperties
              }
            >
              <span className="pipeline-node">{stage.icon}</span>
              <div className="pipeline-body">
                <p className="pipeline-step">{stage.step}</p>
                <h3 className="pipeline-title">{stage.title}</h3>
                <p className="pipeline-text">{stage.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
