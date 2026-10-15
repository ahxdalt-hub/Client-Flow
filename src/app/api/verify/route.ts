import { NextResponse } from "next/server";

import { PRODUCT } from "@/config/site";
import { getPaymentsEnv } from "@/lib/server/env";
import { fetchRazorpayPayment } from "@/lib/server/razorpay";
import {
  DOWNLOAD_TOKEN_TTL_SECONDS,
  encodeDownloadToken,
} from "@/lib/server/payment-crypto";
import { markPaymentCaptured } from "@/lib/server/fulfillment";



export type VerifyResponse =
  | {
      state: "verified";
      paymentId: string;
      orderId: string;
      downloadToken: string;
      downloadTokenExpiresAt: string;
    }
  | { state: "pending"; paymentId: string; providerStatus: string }
  | { state: "failed"; paymentId: string; providerStatus: string }
  | { state: "not_found" }
  | { state: "unfulfillable"; reason: string }
  | { state: "not_configured"; missing: string[] }
  | { state: "missing_payment_id" }
  | { state: "provider_error" };

/**
 * Server-side payment verification for the success page.
 *
 * The payment is fetched from the Razorpay API with the secret key and must
 * be captured, with the exact configured amount and currency, before any
 * download token is issued. A visit to /success alone never grants anything.
 * `session_id` is accepted as an alias for older links; Razorpay's parameter
 * is `payment_id`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId =
    searchParams.get("payment_id") ?? searchParams.get("session_id");

  const parsed = getPaymentsEnv();
  if (!parsed.ok) {
    return NextResponse.json<VerifyResponse>(
      { state: "not_configured", missing: parsed.missing },
      { status: 503 },
    );
  }

  if (!paymentId) {
    return NextResponse.json<VerifyResponse>(
      { state: "missing_payment_id" },
      { status: 400 },
    );
  }

  let payment;
  try {
    payment = await fetchRazorpayPayment(
      {
        keyId: parsed.env.razorpayKeyId,
        keySecret: parsed.env.razorpayKeySecret,
      },
      paymentId,
    );
  } catch (error) {
    console.error("[verify] provider fetch failed:", error);
    return NextResponse.json<VerifyResponse>(
      { state: "provider_error" },
      { status: 502 },
    );
  }

  if (!payment) {
    return NextResponse.json<VerifyResponse>(
      { state: "not_found" },
      { status: 404 },
    );
  }

  if (payment.status === "created" || payment.status === "authorized") {
    return NextResponse.json<VerifyResponse>({
      state: "pending",
      paymentId: payment.id,
      providerStatus: payment.status,
    });
  }

  if (payment.status !== "captured") {
    return NextResponse.json<VerifyResponse>({
      state: "failed",
      paymentId: payment.id,
      providerStatus: payment.status,
    });
  }

  const paidAtIso = new Date(payment.created_at * 1000).toISOString();
  const result = await markPaymentCaptured({
    providerOrderId: payment.order_id,
    providerPaymentId: payment.id,
    amountPaise: payment.amount,
    currency: payment.currency,
    productId: PRODUCT.id,
    paidAtIso,
  });

  if (!result.ok) {
    console.error("[verify] captured payment not fulfilled:", result);
    return NextResponse.json<VerifyResponse>(
      { state: "unfulfillable", reason: result.reason },
      { status: 409 },
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const downloadToken = encodeDownloadToken(
    {
      v: 1,
      pay: payment.id,
      pid: PRODUCT.id,
      exp: nowSeconds + DOWNLOAD_TOKEN_TTL_SECONDS,
    },
    parsed.env.downloadTokenSecret,
  );

  return NextResponse.json<VerifyResponse>({
    state: "verified",
    paymentId: payment.id,
    orderId: result.orderId,
    downloadToken,
    downloadTokenExpiresAt: new Date(
      (nowSeconds + DOWNLOAD_TOKEN_TTL_SECONDS) * 1000,
    ).toISOString(),
  });
}
