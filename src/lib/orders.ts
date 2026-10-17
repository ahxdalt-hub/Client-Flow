import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Order persistence via Supabase (service role — server-side only).
 *
 * Schema note: this deployment's `orders` table is the product-provider
 * model (id uuid, provider, provider_order_id, provider_payment_id,
 * product_id, status, amount_paise, currency, created_at, paid_at,
 * updated_at). Buyer contact details are NOT stored in the existing
 * table; Razorpay's own payment records carry name/email/contact for
 * transactional email, so no personal data lands in our DB at all.
 *
 * A clean rebuild schema lives in supabase/schema.sql (adds analytics /
 * download-audit tables). Everything here degrades gracefully when
 * Supabase is unconfigured or the tables drift.
 */

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function client(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  cached ??= createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  return cached;
}

export type OrderRow = {
  id: string;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  product_id: string | null;
  status: string; // check constraint allows: created | paid | failed
  amount_paise: number | null;
  currency: string | null;
  created_at: string | null;
  paid_at: string | null;
  updated_at: string | null;
};

/** DB status stored for an unpaid order. */
export const ORDER_STATUS_CREATED = "created";

export async function createPendingOrder(input: {
  razorpayOrderId: string;
  productId: string;
  amountPaise: number;
  currency: string;
}): Promise<{ stored: boolean }> {
  const db = client();
  if (!db) return { stored: false };
  const { error } = await db.from("orders").insert({
    id: crypto.randomUUID(),
    provider: "razorpay",
    provider_order_id: input.razorpayOrderId,
    product_id: input.productId,
    status: ORDER_STATUS_CREATED,
    amount_paise: input.amountPaise,
    currency: input.currency,
  });
  if (error) {
    console.warn("[orders] insert failed:", error.message);
    return { stored: false };
  }
  return { stored: true };
}

export async function findOrderByRazorpayId(
  razorpayOrderId: string,
): Promise<OrderRow | null> {
  const db = client();
  if (!db) return null;
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("provider_order_id", razorpayOrderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<OrderRow>();
  if (error) {
    console.warn("[orders] fetch failed:", error.message);
    return null;
  }
  return data;
}

/**
 * How many paid orders exist. Returns null when Supabase is unconfigured or
 * unreachable — callers must treat null as "unknown", never as zero, because
 * the site shows this number to buyers (see src/lib/social-proof.ts).
 */
export async function countPaidOrders(): Promise<number | null> {
  const db = client();
  if (!db) return null;
  try {
    const { count, error } = await db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid");
    if (error) {
      console.warn("[orders] count failed:", error.message);
      return null;
    }
    return count ?? null;
  } catch (error) {
    console.warn("[orders] count threw:", error);
    return null;
  }
}

/**
 * Marks the newest matching row paid. Returns `transitioned` only when this
 * call flipped created → paid. Razorpay callbacks (verify + webhook) arrive
 * concurrently and at-least-once, so callers use `transitioned` to fire
 * emails/side effects exactly once — the conditional `.eq("status", created)`
 * update is the idempotency primitive here (supabase-js builds parameterised
 * queries — user values are never interpolated into SQL).
 */
export async function markOrderPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}): Promise<{ stored: boolean; transitioned: boolean }> {
  const db = client();
  if (!db) return { stored: false, transitioned: false };

  // The existing schema has no unique constraint on provider_order_id, so
  // pick the newest matching row and update it by its primary key.
  const latest = await db
    .from("orders")
    .select("id")
    .eq("provider_order_id", input.razorpayOrderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (latest.error || !latest.data) {
    console.warn("[orders] no row to mark paid:", latest.error?.message);
    return { stored: false, transitioned: false };
  }

  // Conditional on the previous status: an already-paid row yields zero
  // updated rows, which is the idempotency signal for duplicate callbacks.
  const { data, error } = await db
    .from("orders")
    .update({
      status: "paid",
      provider_payment_id: input.razorpayPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", latest.data.id)
    .eq("status", ORDER_STATUS_CREATED)
    .select("id");

  if (error) {
    console.warn("[orders] paid-update failed:", error.message);
    return { stored: false, transitioned: false };
  }
  return { stored: true, transitioned: (data?.length ?? 0) > 0 };
}

/**
 * Refund/failure path: flip a paid order to "failed" so every surface that
 * checks status (order page, download route) stops granting access. Only a
 * paid row transitions — refund callbacks also arrive at-least-once.
 */
export async function revokeOrderAccess(
  razorpayOrderId: string,
): Promise<{ revoked: boolean }> {
  const db = client();
  if (!db) return { revoked: false };

  const latest = await db
    .from("orders")
    .select("id")
    .eq("provider_order_id", razorpayOrderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (latest.error || !latest.data) {
    console.warn("[orders] no row to revoke:", latest.error?.message);
    return { revoked: false };
  }

  const { data, error } = await db
    .from("orders")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", latest.data.id)
    .eq("status", "paid")
    .select("id");

  if (error) {
    console.warn("[orders] revoke failed:", error.message);
    return { revoked: false };
  }
  return { revoked: (data?.length ?? 0) > 0 };
}

/**
 * First-party analytics. The `analytics_events` table is created by
 * supabase/schema.sql; until it exists, events are logged to the server
 * console so the flow is visible without failing.
 */
export async function logEvent(
  event: string,
  props: Record<string, unknown>,
): Promise<{ stored: boolean }> {
  console.info(`[analytics:${event}]`, JSON.stringify(props));
  const db = client();
  if (!db) return { stored: false };
  const { error } = await db.from("analytics_events").insert({ event, props });
  if (error) {
    if (!/schema cache|table/i.test(error.message)) {
      console.warn("[analytics] insert failed:", error.message);
    }
    return { stored: false };
  }
  return { stored: true };
}

/**
 * Download audit trail: order id + a salted IP hash (raw IPs are never
 * stored). Writes to `download_log` (see supabase/schema.sql). Degrades to a
 * console line when Supabase is unset or the table has not been created yet.
 * The legacy `download_events` table is not used — it requires an
 * `entitlement_id` this app never produces.
 */
export async function logDownload(
  orderId: string | null,
  ipHash: string,
): Promise<{ stored: boolean }> {
  console.info(`[download-log] ${orderId ?? "-"} ${ipHash}`);
  const db = client();
  if (!db) return { stored: false };
  const { error } = await db
    .from("download_log")
    .insert({ order_id: orderId, ip_hash: ipHash });
  if (error) {
    if (!/schema cache|table|column/i.test(error.message)) {
      console.warn("[download-log] insert failed:", error.message);
    }
    return { stored: false };
  }
  return { stored: true };
}
