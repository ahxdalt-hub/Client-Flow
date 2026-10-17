/**
 * Customer figure — the pure, client-safe half.
 *
 * Split out from `social-proof.ts` (which is `server-only`, because it reads
 * the paid-order count from Supabase) so that presentational components like
 * `<TrustBox />` can render in both server and client trees — the final CTA
 * band is a client component — without dragging a server-only import across
 * the boundary, which Turbopack rejects at build time.
 *
 * See social-proof.ts for the rules this number has to follow.
 */

/**
 * Customers served to date. Owner-declared.
 *
 * This is the floor the site starts from. Orders recorded on this storefront
 * are added on top of it (see social-proof.ts), so the displayed figure rises
 * on its own as the shop sells.
 *
 * Raise it only when the real number is genuinely higher, and only by an
 * amount you can evidence from your own records. It is rounded down on
 * display, so understating costs you nothing.
 */
export const DECLARED_CUSTOMERS = 200;

/**
 * Below this many real buyers we do not show faces even if some are supplied —
 * a row of four portraits under "200+" reads as a stock-photo shrug.
 */
export const CROWD_THRESHOLD = 4;

/**
 * Real buyer photos, if you have them — with written permission, cropped
 * square, and only for people who actually bought.
 *
 *   export const BUYER_AVATARS = ["/images/buyers/ananya.jpg"];
 */
export const BUYER_AVATARS: string[] = [];

/**
 * Rounds down to a "200+"-style figure. Rounding down — never up — keeps the
 * claim true no matter how the count moves between deploys.
 */
export function roundSoldCount(sold: number): number {
  if (sold < 10) return sold;
  if (sold < 100) return Math.floor(sold / 10) * 10;
  if (sold < 1000) return Math.floor(sold / 50) * 50;
  return Math.floor(sold / 100) * 100;
}

/** "200+" — for text, where a <Counter> would be overkill. */
export function formatSoldCount(sold: number): string {
  return `${roundSoldCount(sold)}+`;
}
