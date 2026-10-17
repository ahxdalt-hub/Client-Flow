import { cn } from "@/lib/cn";

/**
 * ClientFlow brand mark.
 * An abstract "flow" glyph: three rounded strokes sweeping forward
 * through a gate, reading as both a "C" and a forward arrow.
 * Rendered with currentColor so it adapts to any surface.
 */
export function LogoMark({
  className,
  size = 34,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        width="40"
        height="40"
        rx="11"
        fill="currentColor"
        className="text-ink"
      />
      {/* the flowing strokes */}
      <path
        d="M26.5 8.5c-2.1-1.6-4.9-2-7.4-.9l-5.9 2.6a6.8 6.8 0 0 0-3.7 6.9l.7 6.4-4.4-1.5"
        stroke="#FBFAF7"
        strokeWidth="0"
      />
      <path
        d="M27.6 9.2A9.8 9.8 0 0 0 15.5 7.9l-4.2 1.9a9.6 9.6 0 0 0-5.6 9.8l.4 4.1 4.8 1.7-1.2-5.9a5.6 5.6 0 0 1 3.2-5.7l4.2-1.9a5.8 5.8 0 0 1 7.1 1l3.4 3.6z"
        fill="#FBFAF7"
      />
      <path
        d="M12.4 30.4c5.5 1.4 11.2.2 16.4-2.3l4.6-2.3c-2.2 4.8-6.8 7.1-12 7.4-2.1.1-4.1.1-6-.4z"
        fill="#B24D26"
      />
      <circle cx="30.4" cy="24.7" r="2.6" fill="#B24D26" />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={compact ? 28 : 34} />
      {!compact && (
        <span className="display text-[1.35rem] leading-none text-ink">
          Client<span className="text-accent">Flow</span>
        </span>
      )}
    </span>
  );
}
