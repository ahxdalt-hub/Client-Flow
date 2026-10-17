import { cn } from "@/lib/cn";

/**
 * Ambient, decorative art built from CSS + SVG only — no image assets.
 * Everything here is aria-hidden: it is atmosphere, never information.
 */

/** Slow-moving aurora of brand-coloured blobs. Pure CSS animation. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("aurora", className)}>
      <span className="aurora-blob aurora-blob--a" />
      <span className="aurora-blob aurora-blob--b" />
      <span className="aurora-blob aurora-blob--c" />
    </div>
  );
}

/** Fine film grain. Kept extremely subtle — it only adds texture. */
export function Grain({ className, opacity = 0.4 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grain", className)}
      style={{ opacity }}
    />
  );
}

/**
 * Hairline grid that fades out from the top. Used behind the hero so the
 * page reads as "engineered" rather than flat.
 */
export function GridField({
  className,
  id = "cf-grid",
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-line", className)}
    >
      <defs>
        <pattern id={`${id}-pattern`} width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M46 0H0V46" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <radialGradient id={`${id}-fade`} cx="50%" cy="-10%" r="95%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="62%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-pattern)`} mask={`url(#${id}-mask)`} />
    </svg>
  );
}

/**
 * Concentric arcs — a quiet "signal" motif that nods to outreach
 * reaching outward. Draws itself once revealed.
 */
export function SignalArcs({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className={cn("signal-arcs", className)}
      fill="none"
    >
      <circle className="signal-arc" cx="200" cy="200" r="70" pathLength="1" />
      <circle className="signal-arc" cx="200" cy="200" r="120" pathLength="1" />
      <circle className="signal-arc" cx="200" cy="200" r="170" pathLength="1" />
      <circle className="signal-arc" cx="200" cy="200" r="220" pathLength="1" />
      <circle cx="200" cy="200" r="7" className="signal-core" />
    </svg>
  );
}

/**
 * A dot that travels along a soft arc — the "message in flight" flourish
 * for the hero. Decorative only.
 */
export function FlowRibbon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 220"
      className={cn("flow-ribbon", className)}
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        id="cf-ribbon-path"
        d="M-20 150C80 150 120 40 220 40s140 110 240 110 90-70 180-70"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="5 7"
        strokeLinecap="round"
      />
      <circle r="4" className="flow-ribbon-dot">
        <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
          <mpath href="#cf-ribbon-path" />
        </animateMotion>
      </circle>
    </svg>
  );
}
