import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Pure Razorpay verification helpers — no secrets of their own, no network,
 * no "server-only" guard, so `node --test` can exercise them directly.
 * Every caller passes the secret in explicitly; callers live in guarded
 * server code (razorpay.ts, api routes).
 */

/** Constant-time comparison that never throws on malformed input. */
export function signaturesMatch(received: string, expected: string): boolean {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Checkout-flow signature Razorpay's hosted sheet returns alongside the
 * payment: HMAC-SHA256(order_id|payment_id, key_secret), hex.
 * Never trust the browser claiming success — the sheet’s client callback is
 * only a hint; this signature plus an authenticated payment fetch is the proof.
 */
export function verifyRazorpayPaymentSignature(input: {
  keySecret: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!input.keySecret || !input.orderId || !input.paymentId || !input.signature) {
    return false;
  }
  const expected = createHmac("sha256", input.keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return signaturesMatch(input.signature, expected);
}

/**
 * Webhook signature (dashboard-configured secret): HMAC-SHA256(raw_body,
 * secret), hex, delivered in the X-Razorpay-Signature header. Rejecting this
 * rejects everything else — their timestamps are not trusted for replay
 * beyond Razorpay's own retry policy.
 */
export function verifyRazorpayWebhookSignature(input: {
  secret: string;
  rawBody: string;
  signature: string;
}): boolean {
  if (!input.secret || !input.signature) return false;
  const expected = createHmac("sha256", input.secret)
    .update(input.rawBody)
    .digest("hex");
  return signaturesMatch(input.signature, expected);
}

/* ── Webhook payload classification ────────────────────────────────────── */

export type ParsedWebhook = {
  event: string;
  payment: {
    id?: string;
    order_id?: string;
    amount?: number;
    email?: string;
    notes?: Record<string, string>;
  } | null;
  refund: {
    id?: string;
    payment_id?: string;
    amount?: number;
  } | null;
};

/** Shape-validate (never trust depth) without pulling a schema library in. */
export function parseWebhookBody(raw: string): ParsedWebhook | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.event !== "string" || !obj.event) return null;

  const payload = obj.payload;
  return {
    event: obj.event,
    payment: readEntity(payload, "payment") as ParsedWebhook["payment"],
    refund: readEntity(payload, "refund") as ParsedWebhook["refund"],
  };
}

function readEntity(payload: unknown, key: string): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const entity = (payload as Record<string, unknown>)[key];
  if (!entity || typeof entity !== "object") return null;
  const inner = (entity as Record<string, unknown>).entity;
  if (!inner || typeof inner !== "object") return null;
  return inner as Record<string, unknown>;
}

export type WebhookAction =
  | { type: "fulfil"; orderId: string; paymentId: string }
  | { type: "refund"; refundId: string; paymentId: string }
  | { type: "failed"; orderId: string | null }
  | { type: "ignore"; reason: string }
  | { type: "reject"; reason: string }; // malformed payload → 400

/**
 * Decide what a signature-verified webhook means for our fulfillment flow.
 * Razorpay delivers events at-least-once and out of order — the routes that
 * consume this must stay idempotent, which is also why this returns the
 * same classification for a duplicate `payment.captured`.
 */
export function classifyWebhookEvent(parsed: ParsedWebhook | null): WebhookAction {
  if (!parsed) return { type: "reject", reason: "malformed" };
  const payment = parsed.payment;

  switch (parsed.event) {
    case "payment.captured":
      if (!payment?.id || !payment.order_id) {
        if (payment?.id && !payment.order_id) {
          return { type: "ignore", reason: "invoiced-payment-without-order" };
        }
        return { type: "reject", reason: "payment-missing-ids" };
      }
      return {
        type: "fulfil",
        orderId: payment.order_id,
        paymentId: payment.id,
      };
    case "refund.processed":
    case "refund.created":
      if (!parsed.refund?.payment_id) {
        return { type: "reject", reason: "refund-missing-payment-id" };
      }
      return {
        type: "refund",
        refundId: parsed.refund.id ?? "unknown",
        paymentId: parsed.refund.payment_id,
      };
    case "payment.failed":
      return { type: "failed", orderId: payment?.order_id ?? null };
    default:
      return { type: "ignore", reason: parsed.event };
  }
}
