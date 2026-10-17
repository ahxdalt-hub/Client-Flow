import { cn } from "@/lib/cn";
import { formatSoldCount } from "@/lib/customer-count";

/**
 * The customer trust box.
 *
 * Deliberately built from things that are checkable rather than from flourish:
 *
 *  - the headline is the customer figure, which resolves through
 *    src/lib/social-proof.ts (off-store customers + real paid orders, rounded
 *    down) rather than a string typed in here;
 *  - the three supporting lines are promises made elsewhere on the site —
 *    one-time payment (pricing.ts), instant delivery (the order page),
 *    and the refund window (refund-policy) — so nothing here is a new claim;
 *  - **no stars and no review counts.** There is no review system, and an
 *    invented rating is both a misleading claim and a Google structured-data
 *    violation. A checkmark emblem carries the same "this is verified" signal
 *    without inventing a score.
 *  - **no stock faces.** A stranger's photograph under a customers claim is a
 *    false endorsement.
 *
 * `tone="dark"` is for placement over the ink CTA band.
 */
export function TrustBox({
  customers,
  tone = "light",
  className,
}: {
  /** Resolved customer count — pass `await getCustomerCount()`. */
  customers: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  const rows = [
    "One-time payment — no subscription",
    "Files download the moment you pay",
    "Refunded if delivery fails on our side",
  ];

  return (
    <div
      className={cn(
        "flex w-full max-w-sm gap-4 rounded-[var(--radius-card)] border p-5",
        dark
          ? "border-ivory/15 bg-ivory/[0.06] backdrop-blur-md"
          : "border-line bg-paper shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
          dark ? "bg-accent/20 text-accent" : "bg-accent-tint text-accent",
        )}
        aria-hidden="true"
      >
        {/* Shield + tick: "checked", not "rated". */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 5 6v5.5c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>

      <div className="min-w-0">
        <p className={cn("flex items-baseline gap-1.5")}>
          <span
            className={cn(
              "display text-[1.75rem] leading-none",
              dark ? "text-ivory" : "text-ink",
            )}
          >
            {formatSoldCount(customers)}
          </span>
          <span
            className={cn(
              "text-[0.9rem] font-semibold",
              dark ? "text-ivory/85" : "text-ink",
            )}
          >
            happy customers
          </span>
        </p>
        <p className={cn("mt-1 text-[0.8rem]", dark ? "text-ivory/60" : "text-muted")}>
          Freelancers &amp; small studios across India
        </p>

        <ul
          className={cn(
            "mt-3.5 space-y-1.5 border-t pt-3.5 text-[0.78rem]",
            dark ? "border-ivory/15 text-ivory/70" : "border-line text-muted",
          )}
        >
          {rows.map((row) => (
            <li key={row} className="flex items-start gap-2">
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
                className="mt-[3px] shrink-0 text-accent"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{row}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
