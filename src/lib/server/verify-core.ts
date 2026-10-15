/**
 * Success-page payment verification, extracted from the route so the rule
 * "never trust the client" can be unit-tested: a payment is only believed
 * after it is fetched from the provider and found captured with the expected
 * amount and currency.
 */

import type { CapturedPaymentInput, MarkPaidResult } from "./fulfillment-types.ts";
import type { DownloadTokenPayload } from "./payment-crypto.ts";

export type ProviderPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: number;
};

export type VerifyDeps = {
  /** Fetches the payment from the provider API (never from the client). */
  fetchPayment: (paymentId: string) => Promise<ProviderPayment | null>;
  markPaymentCaptured: (input: CapturedPaymentInput) => Promise<MarkPaidResult>;
  /** Secret-bound encoder; the caller closes over the signing secret. */
  encodeDownloadToken: (payload: DownloadTokenPayload) => string;
  productId: string;
  downloadTokenTtlSeconds: number;
  nowSeconds: () => number;
};

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
  | { state: "missing_payment_id" }
  | { state: "provider_error" };

export type VerifyResult = {
  status: number;
  body: VerifyResponse;
};

export async function handleVerifyRequest(
  paymentId: string | null,
  deps: VerifyDeps,
): Promise<VerifyResult> {
  if (!paymentId) {
    return { status: 400, body: { state: "missing_payment_id" } };
  }

  let payment: ProviderPayment | null;
  try {
    payment = await deps.fetchPayment(paymentId);
  } catch {
    return { status: 502, body: { state: "provider_error" } };
  }

  if (!payment) {
    return { status: 404, body: { state: "not_found" } };
  }

  if (payment.status === "created" || payment.status === "authorized") {
    return {
      status: 200,
      body: {
        state: "pending",
        paymentId: payment.id,
        providerStatus: payment.status,
      },
    };
  }

  if (payment.status !== "captured") {
    return {
      status: 200,
      body: {
        state: "failed",
        paymentId: payment.id,
        providerStatus: payment.status,
      },
    };
  }

  const paidAtIso = new Date(payment.created_at * 1000).toISOString();
  const result = await deps.markPaymentCaptured({
    providerOrderId: payment.order_id,
    providerPaymentId: payment.id,
    amountPaise: payment.amount,
    currency: payment.currency,
    productId: deps.productId,
    paidAtIso,
  });

  if (!result.ok) {
    return {
      status: 409,
      body: { state: "unfulfillable", reason: result.reason },
    };
  }

  const nowSeconds = deps.nowSeconds();
  const downloadToken = deps.encodeDownloadToken({
    v: 1,
    pay: payment.id,
    pid: deps.productId,
    exp: nowSeconds + deps.downloadTokenTtlSeconds,
  });

  return {
    status: 200,
    body: {
      state: "verified",
      paymentId: payment.id,
      orderId: result.orderId,
      downloadToken,
      downloadTokenExpiresAt: new Date(
        (nowSeconds + deps.downloadTokenTtlSeconds) * 1000,
      ).toISOString(),
    },
  };
}
