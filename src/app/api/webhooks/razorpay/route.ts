import { NextResponse } from "next/server";

import { PRODUCT } from "@/config/site";
import { getPaymentsEnv } from "@/lib/server/env";
import {
  markPaymentCaptured,
  recordPaymentFailed,
  revokeEntitlementForPayment,
} from "@/lib/server/fulfillment";
import { handleRazorpayWebhook } from "@/lib/server/webhook-core";

/**
 * Razorpay webhook receiver. All security decisions live in
 * `handleRazorpayWebhook` (signature gating, idempotent fulfillment, refund
 * revocation); this file only wires the real dependencies.
 */
export async function POST(request: Request) {
  const parsed = getPaymentsEnv();
  if (!parsed.ok) {
    return NextResponse.json(
      { state: "not_configured", missing: parsed.missing },
      { status: 503 },
    );
  }

  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  const { status, body } = await handleRazorpayWebhook(rawBody, signature, {
    webhookSecret: parsed.env.razorpayWebhookSecret,
    productId: PRODUCT.id,
    markPaymentCaptured,
    recordPaymentFailed,
    revokeEntitlementForPayment,
    nowIso: () => new Date().toISOString(),
    log: {
      info: (message) => console.info(`[webhook] ${message}`),
      warn: (message) => console.warn(`[webhook] ${message}`),
      error: (message) => console.error(`[webhook] ${message}`),
    },
  });

  return NextResponse.json(body, { status });
}
