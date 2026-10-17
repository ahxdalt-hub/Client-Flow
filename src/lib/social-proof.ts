import "server-only";

import { countPaidOrders } from "./orders";

/**
 * Social proof, without a single invented number.
 *
 * There is deliberately **no floor, no seed and no placeholder** in this file.
 * The buyer count shown on the page is either the real number of paid orders,
 * or it is not shown at all (see `<ProofChip />`, which falls back to
 * verifiable facts about the product instead).
 *
 * Why so strict: "Bought by 200+" with no 200 sales is a misleading
 * advertisement — Consumer Protection Act 2019 (misleading claims), the CCPA
 * guidelines, ASCI, and e-commerce rules all bite on exactly this — and it is
 * the one claim on a storefront a stranger can disprove in a single search.
 * A new store that says "11 copies sold" is believed. A new store that claims
 * 200 customers is not. Honesty converts better *and* survives scrutiny.
 *
 * When real sales exist, this file needs no edit: `getBuyerCount()` picks them
 * up and `<ProofChip />` upgrades itself automatically.
 */

/**
 * Below this many real buyers, "Bought by N+" oversells what's actually true,
 * so the chip states product facts instead of a crowd. Lower it only if you
 * genuinely have that many sales.
 */
export const CROWD_THRESHOLD = 25;

/**
 * Real buyer photos, if you have them — with written permission, cropped
 * square, and only for people who actually bought. Leave empty and the chip
 * renders no faces at all (never stock portraits: a stranger's face under a
 * "bought by" claim is a false endorsement, not a decoration).
 *
 *   export const BUYER_AVATARS = ["/images/buyers/ananya.jpg"];
 */
export const BUYER_AVATARS: string[] = [];

/**
 * Real paid order count. Cached briefly in-isolate so a burst of homepage hits
 * doesn't hammer Supabase (the Workers runtime has no shared cache here — see
 * the Cache Components note in next.config.ts). Returns `null` when the
 * database is unconfigured or unreachable — callers must treat null as
 * "unknown", never as zero.
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
