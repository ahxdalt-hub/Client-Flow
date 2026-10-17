import { NextResponse } from "next/server";

import { PRICING, amountInPaise, PRODUCT } from "@/lib/pricing";
import {
  createRazorpayOrder,
  fetchRazorpayOrder,
  isRazorpayConfigured,
  razorpayPublicKeyId,
} from "@/lib/razorpay";
import { createPendingOrder } from "@/lib/orders";
import { RATE_LIMITS, checkRateLimit, clientIp } from "@/lib/rate-limit";

type CheckoutBody = {
  name?: string;
  email?: string;
  phone?: string;
  // Browser-generated idempotency key so a retry/re-submit never creates a
  // second payable order for the same logical attempt. The browser never
  // decides price or payment status — this only prevents duplicate orders.
  idempotencyKey?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[0-9+\-\s]{6,18}$/;
const IDEM_RE = /^[a-zA-Z0-9-]{8,64}$/;

/**
 * Single-process checkout-session cache keyed by the client idempotency key.
 * Prevents duplicate Razorpay orders when a slow network double-fires the
 * form or a retried request replays the first one. If the cache is cold
 * (serverless recycle, multi-instance), we simply create a fresh Razorpay
 * order — Razorpay Checkout binds one payment to one order, and duplicate
 * *orders* are harmless; charges cannot be duplicated because only the
 * provider's own sheet can move money. Cache entries expire quickly.
 */
const IDEM_TTL_MS = 30 * 60 * 1000;
const idemCache = new Map<string, { rpOrderId: string; amount: number; expiresAt: number }>();

function rememberIdem(idem: string, rpOrderId: string, amount: number) {
  for (const [k, v] of idemCache) {
    if (v.expiresAt < Date.now()) idemCache.delete(k);
  }
  idemCache.set(idem, { rpOrderId, amount, expiresAt: Date.now() + IDEM_TTL_MS });
}

function tooMany(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many attempts. Please wait a couple of minutes and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const rate = checkRateLimit(
    `checkout:${clientIp(request)}`,
    RATE_LIMITS.checkout,
  );
  if (!rate.ok) return tooMany(rate.retryAfterSeconds);

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const idem = (body.idempotencyKey ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email — the kit is delivered to it." },
      { status: 400 },
    );
  }
  if (phone && !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "That phone number looks off." }, { status: 400 });
  }
  if (idem && !IDEM_RE.test(idem)) {
    return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured on this deployment yet." },
      { status: 503 },
    );
  }

  // Price is always computed from server config (src/lib/pricing.ts); the
  // client's request body cannot influence it.
  const amountPaise = amountInPaise(PRICING.introActive ? PRICING.intro : PRICING.regular);

  // 1. Idempotent replay: same key, cached payable order still exists at
  //    Razorpay → return it instead of creating a duplicate.
  if (idem) {
    const cached = idemCache.get(idem);
    if (cached && cached.expiresAt > Date.now()) {
      try {
        const existing = await fetchRazorpayOrder(cached.rpOrderId);
        if (existing.status === "created" && existing.amount === cached.amount) {
          return NextResponse.json({
            razorpayOrderId: existing.id,
            amount: existing.amount,
            currency: existing.currency,
            keyId: razorpayPublicKeyId(),
            name,
            email,
          });
        }
      } catch (error) {
        console.warn("[checkout] idem cache stale:", error instanceof Error ? error.message : error);
      }
      idemCache.delete(idem);
    }
  }

  const receipt = idem
    ? `cf_${idem}`
    : `cf_${Date.now().toString(36)}`; // Razorpay receipts max 40 chars

  try {
    const rpOrder = await createRazorpayOrder({
      amountPaise,
      currency: PRICING.currency,
      receipt: receipt.slice(0, 40),
      notes: {
        product: PRODUCT.slug,
        name,
        email,
        ...(phone ? { phone } : {}),
        ...(idem ? { idempotencyKey: idem } : {}),
      },
    });

    // Persist intent (no-op if Supabase isn't configured)
    await createPendingOrder({
      razorpayOrderId: rpOrder.id,
      productId: PRODUCT.slug,
      amountPaise,
      currency: PRICING.currency,
    });

    if (idem) rememberIdem(idem, rpOrder.id, amountPaise);

    return NextResponse.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: razorpayPublicKeyId(),
      name,
      email,
    });
  } catch (error) {
    console.error("[checkout] failed:", error);
    return NextResponse.json(
      { error: "Could not start the checkout. Please try again." },
      { status: 502 },
    );
  }
}
