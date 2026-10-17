import "server-only";

/**
 * Razorpay REST helpers. Only used when PAYMENT_PROVIDER=razorpay.
 *
 * All env reads are lazy (per call): on Cloudflare Workers the environment is
 * bound per request, so module-scope reads would capture nothing.
 */

function keyId(): string {
  return process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
}

function keySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET ?? "";
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

export function isRazorpayConfigured() {
  return Boolean(keyId() && keySecret());
}

function authHeader() {
  if (!keyId() || !keySecret()) {
    throw new Error("Razorpay keys are not configured");
  }
  const basic = Buffer.from(`${keyId()}:${keySecret()}`).toString("base64");
  return `Basic ${basic}`;
}

/** Create a Razorpay order. Verifying server-side is mandatory before delivery. */
export async function createRazorpayOrder(input: {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${detail}`);
  }

  return (await res.json()) as RazorpayOrder;
}

/** Fetch an order to double-check its amount/status before fulfilment. */
export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    throw new Error(`Razorpay order fetch failed (${res.status})`);
  }
  return (await res.json()) as RazorpayOrder;
}

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  refunded?: boolean;
};

/**
 * Authenticated payment fetch — the authoritative check that a payment is
 * captured, belongs to the order, and carries the expected amount.
 */
export async function fetchRazorpayPayment(
  paymentId: string,
): Promise<RazorpayPayment | null> {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    throw new Error(`Razorpay payment fetch failed (${res.status})`);
  }
  return (await res.json()) as RazorpayPayment;
}

export function razorpayPublicKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
}

/** Server-side key id (falls back to the public env var for local dev). */
export function razorpayKeyId() {
  return keyId();
}
