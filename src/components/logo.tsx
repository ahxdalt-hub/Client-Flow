import { SITE } from "@/config/site";

/**
 * Marketloom mark: a solid shopping bag whose body carries a plain weave
 * cut out in negative space — the market half of the name meets the loom
 * half, as a single monochrome white shape.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block overflow-hidden rounded-[22%] bg-ink ${className}`}
    >
      <svg viewBox="0 0 64 64" fill="none" className="block h-full w-full">
        <path
          d="M23 24 A9 9 0 0 1 41 24"
          stroke="var(--paper)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M14 24 H50 L45 50 H19 Z"
          fill="var(--paper)"
          stroke="var(--paper)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <g
          stroke="var(--ink)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M16 33 H48 M17 42 H47 M27 23 V51 M37 23 V51" />
        </g>
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">
        {SITE.name}
      </span>
    </span>
  );
}
