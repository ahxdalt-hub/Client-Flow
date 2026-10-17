import "server-only";

import { countPaidOrders } from "./orders";
import { OFFSTORE_CUSTOMERS } from "./customer-count";

/**
 * Customer proof — the server half.
 *
 * ── Two sources, one number ─────────────────────────────────────────
 *
 * 1. `OFFSTORE_CUSTOMERS` — customers the owner has served **outside this
 *    website** (sold locally, in person, before the storefront existed). An
 *    owner-declared figure, so it lives as one constant in version control
 *    rather than as a string typed into a component where it would drift.
 *
 * 2. Real paid orders on this site, counted from the `orders` table.
 *
 * They are added, never replaced, and the total is rounded **down** — so the
 * displayed figure can only understate, and it rises on its own as the
 * storefront sells.
 *
 * ── The rules this file exists to enforce ───────────────────────────
 *
 * - Never invent a number in a component. Every customer figure on the site
 *   resolves here.
 * - No star ratings, no "4.9/5", no review counts. There is no review system,
 *   and an invented rating is both a Google structured-data violation and a
 *   misleading claim — which is why the homepage `Product` markup deliberately
 *   omits `aggregateRating` and `review`.
 * - No stock faces. A stranger's photograph under a customers claim is a false
 *   endorsement, not decoration.
 * - Keep it defensible. The owner should be able to evidence the figure from
 *   sales records if a customer or a regulator ever asks.
 *
 * The pure constants and formatters live in `customer-count.ts` so that
 * presentational components can use them on both sides of the server/client
 * boundary.
 */

export {
  OFFSTORE_CUSTOMERS,
  CROWD_THRESHOLD,
  BUYER_AVATARS,
  roundSoldCount,
  formatSoldCount,
} from "./customer-count";

/**
 * Real paid orders from this storefront. Cached briefly in-isolate so a burst
 * of homepage hits doesn't hammer Supabase (the Workers runtime has no shared
 * cache here — see the Cache Components note in next.config.ts). Returns
 * `null` when the database is unconfigured or unreachable — callers must treat
 * null as "unknown", never as zero.
 */
const BUYER_COUNT_TTL_MS = 5 * 60 * 1000;
let buyerCountCache: { value: number | null; at: number } | null = null;

export async function getBuyerCount(): Promise<number | null> {
  if (buyerCountCache && Date.now() - buyerCountCache.at < BUYER_COUNT_TTL_MS) {
    return buyerCountCache.value;
  }
  try {
    const value = await countPaidOrders();
    buyerCountCache = { value, at: Date.now() };
    return value;
  } catch (error) {
    console.warn("[social-proof] paid count unavailable:", error);
    return null;
  }
}

/**
 * The number shown on the site. Never null: the off-store floor is a declared
 * fact, so a database outage can only ever hide the *increase*, not the base.
 */
export async function getCustomerCount(): Promise<number> {
  const buyers = await getBuyerCount();
  return OFFSTORE_CUSTOMERS + (buyers ?? 0);
}
