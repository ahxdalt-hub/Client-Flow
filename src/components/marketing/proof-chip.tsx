import Image from "next/image";

import { cn } from "@/lib/cn";
import { FILE_COUNT, HANDBOOK_PAGES, SCRIPT_TOTAL } from "@/lib/product-content";
import { BUYER_AVATARS, CROWD_THRESHOLD, formatSoldCount } from "@/lib/social-proof";

/**
 * The proof chip that sits with the buy button.
 *
 * Two honest states, picked by the real paid-order count — never by what would
 * look best:
 *
 *  - **Crowd** (>= CROWD_THRESHOLD real buyers): the usual faces + count, using
 *    only real buyer photos. If none are supplied it shows the count alone
 *    rather than borrowing a stranger's face for it.
 *  - **Facts** (early, or the count is unknown): the strongest verifiable
 *    things we can say instead — the size and shape of the kit. Every number
 *    here maps to a file that actually ships (see product-content.ts).
 *
 * This is why the hero never needs a hand-maintained "copies sold" figure:
 * the moment there are real sales, this element says so by itself.
 */
export function ProofChip({
  buyers,
  className,
}: {
  /** Real paid orders, or null when the count is unknown. */
  buyers: number | null;
  className?: string;
}) {
  const showCrowd = buyers !== null && buyers >= CROWD_THRESHOLD;
  const faces = showCrowd ? BUYER_AVATARS.slice(0, 4) : [];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-paper/90 py-1.5 pl-1.5 pr-3.5 shadow-[var(--shadow-lift)] backdrop-blur-md",
        className,
      )}
    >
      {faces.length > 0 ? (
        <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
          {faces.map((src) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover ring-2 ring-paper"
            />
          ))}
        </span>
      ) : (
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-tint text-accent"
          aria-hidden="true"
        >
          <Check />
        </span>
      )}

      <span className="leading-tight">
        {showCrowd ? (
          <>
            <span className="block text-[0.74rem] font-semibold text-ink">
              Bought by {formatSoldCount(buyers)} buyers
            </span>
            <span className="block text-[0.66rem] text-muted">
              Indian freelancers &amp; small studios
            </span>
          </>
        ) : (
          <>
            <span className="block text-[0.74rem] font-semibold text-ink">
              {SCRIPT_TOTAL} templates &amp; scripts · {FILE_COUNT} files
            </span>
            <span className="block text-[0.66rem] text-muted">
              {HANDBOOK_PAGES}-page handbook · yours to keep
            </span>
          </>
        )}
      </span>
    </span>
  );
}

function Check() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
