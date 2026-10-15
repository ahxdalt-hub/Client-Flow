import "server-only";

import { PRODUCT } from "@/config/site";
import { getAdminClient } from "@/lib/server/db";
import type {
  ActiveEntitlement,
  CapturedPaymentInput,
  MarkPaidResult,
  ProductVersionRecord,
} from "@/lib/server/fulfillment-types";

export type {
  ActiveEntitlement,
  CapturedPaymentInput,
  MarkPaidResult,
  ProductVersionRecord,
};

const PROVIDER = "razorpay";

export const EXPECTED_AMOUNT_PAISE = PRODUCT.priceInr * 100;
export const EXPECTED_CURRENCY = "INR";

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

/** True for errors that mean the product_versions migration is not applied. */
function isMissingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01" || error.code === "42703") {
    return true;
  }
  const message = (error.message ?? "").toLowerCase();
  return message.includes("product_versions") || message.includes("product_version_id");
}

async function loadOrderByPaymentId(
  paymentId: string,
): Promise<{ id: string } | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("provider", PROVIDER)
    .eq("provider_payment_id", paymentId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function loadOrderByProviderOrderId(
  providerOrderId: string,
): Promise<{ id: string; status: string } | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("id, status")
    .eq("provider", PROVIDER)
    .eq("provider_order_id", providerOrderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Loads the current product version row. Returns null when the
 * `product_versions` migration has not been applied — fulfillment then simply
 * leaves the entitlement unpinned and delivery uses the default file paths.
 */
async function loadCurrentProductVersionId(
  productId: string,
): Promise<string | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("product_versions")
    .select("id, version, is_current")
    .eq("product_id", productId)
    .eq("is_current", true)
    .maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return null;
    throw error;
  }
  return data?.id ?? null;
}

/**
 * Loads one product version by id (used by download delivery to resolve the
 * exact files a customer's entitlement covers). Null when unknown or when the
 * migration is not applied.
 */
export async function getProductVersionById(
  versionId: string,
): Promise<ProductVersionRecord | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("product_versions")
    .select("id, product_id, version, csv_path, xlsx_path, record_count")
    .eq("id", versionId)
    .maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return null;
    throw error;
  }
  if (!data) return null;
  return {
    id: data.id,
    productId: data.product_id,
    version: data.version,
    csvPath: data.csv_path,
    xlsxPath: data.xlsx_path,
    recordCount: data.record_count ?? null,
  };
}

/**
 * Records a captured payment and grants the download entitlement exactly
 * once. Safe to call from both the webhook and the success-page verify
 * route, and safe to call repeatedly: unique constraints on
 * `orders.provider_payment_id` and `entitlements.order_id` make duplicate
 * fulfillment impossible. Never call this from a client-claimed value — only
 * from payment data fetched from Razorpay or from a signature-verified
 * webhook.
 */
export async function markPaymentCaptured(
  input: CapturedPaymentInput,
): Promise<MarkPaidResult> {
  const supabase = getAdminClient();
  if (!supabase) {
    return { ok: false, reason: "database_error", detail: "not_configured" };
  }

  if (input.amountPaise !== EXPECTED_AMOUNT_PAISE) {
    return {
      ok: false,
      reason: "amount_mismatch",
      detail: `expected ${EXPECTED_AMOUNT_PAISE} got ${input.amountPaise}`,
    };
  }
  if (input.currency !== EXPECTED_CURRENCY) {
    return {
      ok: false,
      reason: "currency_mismatch",
      detail: `expected ${EXPECTED_CURRENCY} got ${input.currency}`,
    };
  }

  let orderId: string | null = null;

  const byPayment = await loadOrderByPaymentId(input.providerPaymentId);
  if (byPayment) {
    orderId = byPayment.id;
  } else {
    const byOrder = await loadOrderByProviderOrderId(input.providerOrderId);
    if (byOrder && byOrder.status === "paid") {
      // Another worker already finalized this order; find its payment id row.
      orderId = byOrder.id;
    } else if (byOrder) {
      const { data, error } = await supabase
        .from("orders")
        .update({
          provider_payment_id: input.providerPaymentId,
          status: "paid",
          paid_at: input.paidAtIso,
          updated_at: new Date().toISOString(),
        })
        .eq("id", byOrder.id)
        .select("id")
        .single();
      if (error) throw error;
      orderId = data.id;
    } else {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          provider: PROVIDER,
          provider_order_id: input.providerOrderId,
          provider_payment_id: input.providerPaymentId,
          product_id: input.productId,
          status: "paid",
          amount_paise: input.amountPaise,
          currency: input.currency,
          paid_at: input.paidAtIso,
        })
        .select("id")
        .single();
      if (error) {
        if (!isUniqueViolation(error)) throw error;
        // Concurrent fulfillments raced us — reuse the winning row.
        const winner = await loadOrderByPaymentId(input.providerPaymentId);
        if (!winner) throw error;
        orderId = winner.id;
      } else {
        orderId = data.id;
      }
    }
  }

  if (!orderId) {
    throw new Error("order row missing after fulfillment");
  }

  // Grant (or reuse) the entitlement. `ignoreDuplicates` + unique order_id
  // guarantee a single entitlement row per order no matter how often
  // markPaymentCaptured runs. When the product_versions table exists the
  // entitlement is pinned to the current version so later revisions cannot
  // change what this customer receives.
  const versionId = await loadCurrentProductVersionId(input.productId);
  const entitlementRow: {
    order_id: string;
    product_id: string;
    product_version_id?: string;
  } = {
    order_id: orderId,
    product_id: input.productId,
  };
  if (versionId) entitlementRow.product_version_id = versionId;

  const upsert = await supabase
    .from("entitlements")
    .upsert(entitlementRow, { onConflict: "order_id", ignoreDuplicates: true })
    .select("id");

  if (upsert.error) {
    // Race on insert: unique order_id violation handled by ignoreDuplicates,
    // but surface genuine failures.
    if (!isUniqueViolation(upsert.error)) throw upsert.error;
  }

  let entitlementId: string | null = upsert.data?.[0]?.id ?? null;
  let firstFulfillment = entitlementId !== null;

  if (!entitlementId) {
    const existing = await supabase
      .from("entitlements")
      .select("id")
      .eq("order_id", orderId)
      .single();
    if (existing.error) throw existing.error;
    entitlementId = existing.data.id;
    firstFulfillment = false;
  }

  if (!entitlementId) {
    throw new Error("entitlement row missing after fulfillment");
  }

  return { ok: true, orderId, entitlementId, firstFulfillment };
}

/** Marks an order failed without ever downgrading a paid order. */
export async function recordPaymentFailed(input: {
  providerOrderId: string;
  providerPaymentId?: string;
}): Promise<void> {
  const supabase = getAdminClient();
  if (!supabase) return;
  await supabase
    .from("orders")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
      ...(input.providerPaymentId
        ? { provider_payment_id: input.providerPaymentId }
        : {}),
    })
    .eq("provider", PROVIDER)
    .eq("provider_order_id", input.providerOrderId)
    .neq("status", "paid");
}

/** Revokes the entitlement for a refunded payment. Idempotent. */
export async function revokeEntitlementForPayment(
  providerPaymentId: string,
): Promise<void> {
  const supabase = getAdminClient();
  if (!supabase) return;
  const order = await loadOrderByPaymentId(providerPaymentId);
  if (!order) return;
  const now = new Date().toISOString();
  await supabase
    .from("orders")
    .update({ status: "refunded", updated_at: now })
    .eq("id", order.id);
  await supabase
    .from("entitlements")
    .update({ revoked_at: now })
    .eq("order_id", order.id)
    .is("revoked_at", null);
}

/** Looks up a non-revoked entitlement for a verified payment id. */
export async function getActiveEntitlementByPaymentId(
  providerPaymentId: string,
): Promise<ActiveEntitlement | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("entitlements")
    .select(
      "id, product_id, product_version_id, revoked_at, orders!inner ( id, provider_payment_id )",
    )
    .eq("revoked_at", null)
    .eq("orders.provider", PROVIDER)
    .eq("orders.provider_payment_id", providerPaymentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const order = data.orders as unknown as { id: string; provider_payment_id: string };
  return {
    entitlementId: data.id,
    orderId: order.id,
    productId: data.product_id,
    paymentId: order.provider_payment_id,
    productVersionId: data.product_version_id ?? null,
  };
}

export const LINK_ISSUE_RATE_LIMIT = {
  maxPerWindow: 20,
  windowSeconds: 3600,
};

/** Counts recent `link_issued` events for rate limiting. */
export async function countRecentLinkIssues(
  entitlementId: string,
): Promise<number> {
  const supabase = getAdminClient();
  if (!supabase) return 0;
  const since = new Date(
    Date.now() - LINK_ISSUE_RATE_LIMIT.windowSeconds * 1000,
  ).toISOString();
  const { count, error } = await supabase
    .from("download_events")
    .select("id", { count: "exact", head: true })
    .eq("entitlement_id", entitlementId)
    .eq("kind", "link_issued")
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

/** Minimal download audit: when a signed link set was issued. No PII. */
export async function recordLinkIssued(entitlementId: string): Promise<void> {
  const supabase = getAdminClient();
  if (!supabase) return;
  const { error } = await supabase.from("download_events").insert({
    entitlement_id: entitlementId,
    kind: "link_issued",
  });
  if (error) throw error;
}
