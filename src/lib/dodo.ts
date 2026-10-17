import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Dodo Payments (Merchant of Record) — hosted checkout + Standard Webhooks.
 *
 * Test mode uses `https://test.dodopayments.com`; live uses
 * `https://live.dodopayments.com`. A test key only works against test mode.
 *
 * Every env read is lazy (per call): on Cloudflare Workers the environment is
 * bound per request, so module-scope reads would capture nothing.
 */

function apiKey(): string {
  return process.env.DODO_API_KEY ?? "";
}

function webhookKey(): string {
  return process.env.DODO_WEBHOOK_KEY ?? "";
}

function baseUrl(): string {
  return (process.env.DODO_API_BASE ?? "https://test.dodopayments.com").replace(
    /\/+$/,
    "",
  );
}

/** The priced product the storefront sells (created in the Dodo dashboard). */
export function dodoProductId(): string {
  return process.env.DODO_PRODUCT_ID ?? "";
}

export function isDodoConfigured(): boolean {
  return Boolean(apiKey() && dodoProductId());
}

export type DodoCheckoutSession = {
  session_id: string;
  checkout_url?: string | null;
};

/** Create a hosted checkout session. The URL is single-use (24h expiry). */
export async function createDodoCheckoutSession(input: {
  email: string;
  name: string;
  orderId: string;
  orderCode?: string;
  returnUrl: string;
}): Promise<DodoCheckoutSession> {
  const res = await fetch(`${baseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [{ product_id: dodoProductId(), quantity: 1 }],
      customer: { email: input.email, name: input.name },
      return_url: input.returnUrl,
      metadata: {
        order_id: input.orderId,
        ...(input.orderCode ? { order_code: input.orderCode } : {}),
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Dodo checkout failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as DodoCheckoutSession;
}

export type DodoPayment = {
  payment_id: string;
  status: string; // succeeded | failed | processing | cancelled | ...
  total_amount?: number;
  currency?: string;
  metadata?: Record<string, string> | null;
};

/** Authenticated payment fetch — the authoritative status check. */
export async function fetchDodoPayment(paymentId: string): Promise<DodoPayment | null> {
  const res = await fetch(
    `${baseUrl()}/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Bearer ${apiKey()}` } },
  );
  if (!res.ok) {
    throw new Error(`Dodo payment fetch failed (${res.status})`);
  }
  return (await res.json()) as DodoPayment;
}

/**
 * Verify a Standard Webhooks signature.
 * signed content = `${webhook-id}.${webhook-timestamp}.${rawBody}`,
 * HMAC-SHA256 with the base64-decoded `whsec_…` key, base64-encoded.
 */
export function verifyDodoWebhook(input: {
  rawBody: string;
  id: string;
  timestamp: string;
  signature: string;
}): boolean {
  const key0 = webhookKey();
  if (!key0 || !input.id || !input.timestamp || !input.signature) return false;

  const keyPart = key0.startsWith("whsec_") ? key0.slice(6) : key0;
  let key: Buffer;
  try {
    key = Buffer.from(keyPart, "base64");
  } catch {
    return false;
  }
  if (key.length === 0) return false;

  const signed = `${input.id}.${input.timestamp}.${input.rawBody}`;
  const expected = createHmac("sha256", key).update(signed).digest("base64");

  // Header is a space-separated list of `v1,<signature>` entries.
  for (const part of input.signature.split(" ")) {
    const sig = part.includes(",") ? part.slice(part.indexOf(",") + 1) : part;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}
