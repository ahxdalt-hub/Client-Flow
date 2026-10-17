import "server-only";
import { cacheLife } from "next/cache";

import { countPaidOrders } from "./orders";

/**
 * The "copies sold" number shown to buyers.
 *
 * Two sources, and the honest one wins:
 *
 *  1. `countPaidOrders()` — the real count of paid rows in the orders table.
 *  2. `SOLD_COUNT_FLOOR` — a hand-maintained floor, used when the database
 *     isn't reachable (or when a sale was taken on a channel that never wrote
 *     an order row, e.g. a direct UPI transfer). It is a floor, so the live
 *     count always overrides it once it catches up.
 *
 * Keep `SOLD_COUNT_FLOOR` at or below the number of copies you can actually
 * account for. It is the one number on this site a buyer might ask you to
 * stand behind — moving it ahead of real sales is the thing to never do.
 */
export const SOLD_COUNT_FLOOR = 200;

async function livePaidCount(): Promise<number | null> {
  try {
    return await countPaidOrders();
  } catch (error) {
    console.warn("[social-proof] paid count unavailable:", error);
    return null;
  }
}

/**
 * Real sales count, cached for an hour so the homepage stays fully static.
 * Every visitor sees the same number until the next revalidation.
 */
export async function getSoldCount(): Promise<number> {
  "use cache";
  cacheLife("hours");

  const live = await livePaidCount();
  return Math.max(live ?? 0, SOLD_COUNT_FLOOR);
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
