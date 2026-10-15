import { NextResponse } from "next/server";

import { PRODUCT } from "@/config/site";
import { getPaymentsEnv } from "@/lib/server/env";
import { verifyRazorpayWebhookSignature } from "@/lib/server/payment-crypto";
import {
  markPaymentCaptured,
  recordPaymentFailed,
  revokeEntitlementForPayment,
} from "@/lib/server/fulfillment";



type RazorpayWebhookPaymentEntity = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status?: string;
  created_at?: number;
};

type RazorpayWebhookRefundEntity = {
  payment_id: string;
  status?: string;
};

type RazorpayWebhookEvent = {
  event: string;
  payload: {
    payment?: { entity?: RazorpayWebhookPaymentEntity };
    refund?: { entity?: RazorpayWebhookRefundEntity };
  };
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * Razorpay webhook receiver.
 *
 * - The signature (HMAC-SHA256 of the raw body with RAZORPAY_WEBHOOK_SECRET)
 *   is validated before the payload is trusted at all.
 * - Fulfillment runs through the same idempotent `markPaymentCaptured` path
 *   as /api/verify, so duplicate deliveries can never double-fulfill.
 * - 200 for anything permanently ignorable (unknown events, amount/currency
 *   mismatches) so Razorpay stops retrying; 5xx only for transient errors so
 *   Razorpay retries safely.
 */
export async function POST(request: Request) {
  const parsed = getPaymentsEnv();
  if (!parsed.ok) {
    return jsonResponse(
      { state: "not_configured", missing: parsed.missing },
      503,
    );
  }

  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (
    !verifyRazorpayWebhookSignature(
      rawBody,
      signature,
      parsed.env.razorpayWebhookSecret,
    )
  ) {
    console.warn("[webhook] rejected: invalid signature");
    return jsonResponse({ state: "invalid_signature" }, 401);
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return jsonResponse({ state: "invalid_payload" }, 400);
  }

  try {
    switch (event.event) {
      case "payment.captured": {
        const entity = event.payload.payment?.entity;
        if (!entity?.id || !entity.order_id) {
          return jsonResponse({ state: "ignored", reason: "incomplete_payload" });
        }

        const paidAtIso =
          typeof entity.created_at === "number"
            ? new Date(entity.created_at * 1000).toISOString()
            : new Date().toISOString();

        const result = await markPaymentCaptured({
          providerOrderId: entity.order_id,
          providerPaymentId: entity.id,
          amountPaise: entity.amount,
          currency: entity.currency,
          productId: PRODUCT.id,
          paidAtIso,
        });

        if (!result.ok) {
          // Permanent mismatch — acknowledge so Razorpay stops retrying.
          console.error("[webhook] payment captured but not fulfilled:", result);
          return jsonResponse({ state: "ignored", reason: result.reason });
        }

        console.info(
          `[webhook] payment ${entity.id} fulfilled (first=${result.firstFulfillment})`,
        );
        return jsonResponse({
          state: "fulfilled",
          firstFulfillment: result.firstFulfillment,
        });
      }

      case "payment.failed": {
        const entity = event.payload.payment?.entity;
        if (!entity?.order_id) {
          return jsonResponse({ state: "ignored", reason: "incomplete_payload" });
        }
        await recordPaymentFailed({
          providerOrderId: entity.order_id,
          providerPaymentId: entity.id,
        });
        return jsonResponse({ state: "recorded_failed" });
      }

      case "refund.processed":
      case "refund.failed": {
        if (event.event !== "refund.processed") {
          return jsonResponse({ state: "ignored" });
        }
        const entity = event.payload.refund?.entity;
        if (!entity?.payment_id) {
          return jsonResponse({ state: "ignored", reason: "incomplete_payload" });
        }
        await revokeEntitlementForPayment(entity.payment_id);
        console.info(`[webhook] entitlement revoked for ${entity.payment_id}`);
        return jsonResponse({ state: "revoked" });
      }

      default:
        return jsonResponse({ state: "ignored", event: event.event });
    }
  } catch (error) {
    // Transient failure — 500 so Razorpay retries; retry is idempotent.
    console.error("[webhook] processing error:", error);
    return jsonResponse({ state: "processing_error" }, 500);
  }
}
