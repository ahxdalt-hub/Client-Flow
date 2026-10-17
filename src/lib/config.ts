import "server-only";

/**
 * Server-side configuration. Re-exports client-safe product constants
 * (src/lib/pricing.ts — the single source of truth for prices) so server
 * code imports one place.
 */

export {
  PRODUCT,
  PRICING,
  DELIVERY,
  activePrice,
  amountInPaise,
  CONTACT,
  REFUND_POLICY_PATH,
  REFUND_WINDOW_DAYS,
} from "./pricing";

/** How long a signed download token stays valid, in seconds (30 days). */
export const DOWNLOAD_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
// Download policy: an issued token is valid for the whole TTL regardless of
// how many times it's used (standard for digital deliveries). Re-issues
// beyond 30 days are handled manually via support email.

export const WEBSITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
