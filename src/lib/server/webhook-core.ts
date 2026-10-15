/**
 * Razorpay webhook handling, extracted from the route so the security-critical
 * behaviour (signature gating, idempotent fulfillment, refund revocation) can
 * be unit-tested without a framework, a database, or network access.
 *
 * The route wires the real dependencies; this module only decides what the
 * response is. No secrets are read here — the caller injects them.
 */

import { verifyRazorpayWebhookSignature } from "./payment-crypto.ts";
import type { CapturedPaymentInput, MarkPaidResult } from "./fulfillment-types.ts";

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

export type WebhookDeps = {
  webhookSecret: string;
  productId: string;
  markPaymentCaptured: (input: CapturedPaymentInput) => Promise<MarkPaidResult>;
  recordPaymentFailed: (input: {
    providerOrderId: string;
    providerPaymentId?: string;
  }) => Promise<void>;
  revokeEntitlementForPayment: (paymentId: string) => Promise<void>;
  nowIso: () => string;
  log?: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
};

export type WebhookResponse = {
  status: number;
  body: Record<string, unknown>;
};

const silentLog = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

/**
 * Handles one webhook delivery.
 *
 * - The signature is validated over the raw body before the payload is
 *   trusted at all; invalid → 401 and nothing else runs.
 * - `payment.captured` and `/api/verify` share `markPaymentCaptured`, which is
 *   idempotent, so duplicate deliveries cannot double-fulfill.
 * - 200 for permanently ignorable payloads (Razorpay stops retrying), 5xx only
 *   for transient failures (Razorpay retries, which is safe).
 */
export async function handleRazorpayWebhook(
  rawBody: string,
  signature: string | null | undefined,
  deps: WebhookDeps,
): Promise<WebhookResponse> {
  const log = deps.log ?? silentLog;

  if (
    !verifyRazorpayWebhookSignature(rawBody, signature, deps.webhookSecret)
  ) {
    log.warn("rejected: invalid signature");
    return { status: 401, body: { state: "invalid_signature" } };
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return { status: 400, body: { state: "invalid_payload" } };
  }

  try {
    switch (event.event) {
      case "payment.captured": {
        const entity = event.payload.payment?.entity;
        if (!entity?.id || !entity.order_id) {
          return {
            status: 200,
            body: { state: "ignored", reason: "incomplete_payload" },
          };
        }

        const paidAtIso =
          typeof entity.created_at === "number"
            ? new Date(entity.created_at * 1000).toISOString()
            : deps.nowIso();

        const result = await deps.markPaymentCaptured({
          providerOrderId: entity.order_id,
          providerPaymentId: entity.id,
          amountPaise: entity.amount,
          currency: entity.currency,
          productId: deps.productId,
          paidAtIso,
        });

        if (!result.ok) {
          // Permanent mismatch — acknowledge so Razorpay stops retrying.
          log.error(`payment captured but not fulfilled: ${result.reason}`);
          return { status: 200, body: { state: "ignored", reason: result.reason } };
        }

        log.info(
          `payment ${entity.id} fulfilled (first=${result.firstFulfillment})`,
        );
        return {
          status: 200,
          body: {
            state: "fulfilled",
            firstFulfillment: result.firstFulfillment,
          },
        };
      }

      case "payment.failed": {
        const entity = event.payload.payment?.entity;
        if (!entity?.order_id) {
          return {
            status: 200,
            body: { state: "ignored", reason: "incomplete_payload" },
          };
        }
        await deps.recordPaymentFailed({
          providerOrderId: entity.order_id,
          providerPaymentId: entity.id,
        });
        return { status: 200, body: { state: "recorded_failed" } };
      }

      case "refund.processed": {
        const entity = event.payload.refund?.entity;
        if (!entity?.payment_id) {
          return {
            status: 200,
            body: { state: "ignored", reason: "incomplete_payload" },
          };
        }
        await deps.revokeEntitlementForPayment(entity.payment_id);
        log.info(`entitlement revoked for ${entity.payment_id}`);
        return { status: 200, body: { state: "revoked" } };
      }

      default:
        return { status: 200, body: { state: "ignored", event: event.event } };
    }
  } catch {
    // Transient failure — 500 so Razorpay retries; retry is idempotent.
    return { status: 500, body: { state: "processing_error" } };
  }
}
