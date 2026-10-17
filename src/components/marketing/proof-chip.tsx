import Image from "next/image";

import { cn } from "@/lib/cn";
import { BUYER_AVATARS, formatSoldCount } from "@/lib/customer-count";

/**
 * The proof chip that sits with the buy button.
 *
 * Shows the customer figure resolved by src/lib/social-proof.ts — off-store
 * customers plus real paid orders, rounded down. It is never a literal typed
 * into this component, so it cannot drift from the one place that owns it.
 *
 * Faces appear only when real, consented buyer photographs have been supplied.
 * Otherwise a check emblem carries the signal — never a stock portrait, which
 * would be a false endorsement rather than decoration.
 */
export function ProofChip({
  customers,
  className,
}: {
  /** Resolved customer count — pass `await getCustomerCount()`. */
  customers: number;
  className?: string;
}) {
  const faces = BUYER_AVATARS.slice(0, 4);

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
        <span className="block text-[0.74rem] font-semibold text-ink">
          {formatSoldCount(customers)} happy customers
        </span>
        <span className="block text-[0.66rem] text-muted">
          Indian freelancers &amp; small studios
        </span>
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
