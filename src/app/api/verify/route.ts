import { NextResponse } from "next/server";

import { PRODUCT } from "@/config/site";
import { getPaymentsEnv } from "@/lib/server/env";
import { fetchRazorpayPayment } from "@/lib/server/razorpay";
import {
  DOWNLOAD_TOKEN_TTL_SECONDS,
  encodeDownloadToken,
} from "@/lib/server/payment-crypto";
import { markPaymentCaptured } from "@/lib/server/fulfillment";
import { handleVerifyRequest } from "@/lib/server/verify-core";

/**
 * Server-side payment verification for the success page.
 *
 * The payment is fetched from the Razorpay API with the secret key and must be
 * captured with the exact configured amount and currency before any download
 * token is issued. A visit to /success alone never grants anything. The
 * decision logic lives in `handleVerifyRequest` so it can be unit-tested.
 * `session_id` is accepted as an alias for older links; Razorpay's parameter
 * is `payment_id`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId =
    searchParams.get("payment_id") ?? searchParams.get("session_id");

  const parsed = getPaymentsEnv();
  if (!parsed.ok) {
    return NextResponse.json(
      { state: "not_configured", missing: parsed.missing },
      { status: 503 },
    );
  }

  const { status, body } = await handleVerifyRequest(paymentId, {
    fetchPayment: (id) =>
      fetchRazorpayPayment(
        {
          keyId: parsed.env.razorpayKeyId,
          keySecret: parsed.env.razorpayKeySecret,
        },
        id,
      ),
    markPaymentCaptured,
    encodeDownloadToken: (payload) =>
      encodeDownloadToken(payload, parsed.env.downloadTokenSecret),
    productId: PRODUCT.id,
    downloadTokenTtlSeconds: DOWNLOAD_TOKEN_TTL_SECONDS,
    nowSeconds: () => Math.floor(Date.now() / 1000),
  });

  if (body.state === "unfulfillable") {
    console.error("[verify] captured payment not fulfilled:", body.reason);
  }

  return NextResponse.json(body, { status });
}
