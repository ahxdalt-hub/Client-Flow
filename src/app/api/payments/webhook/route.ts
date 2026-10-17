import { NextResponse, after } from "next/server";

import { DOWNLOAD_TOKEN_TTL_SECONDS, WEBSITE_URL } from "@/lib/config";
import { fetchRazorpayPayment } from "@/lib/razorpay";
import {
  classifyWebhookEvent,
  parseWebhookBody,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay-signature";
import { findOrderByRazorpayId, markOrderPaid, revokeOrderAccess, logEvent } from "@/lib/orders";
import { createDownloadToken } from "@/lib/tokens";
import { sendOrderPaidEmail } from "@/lib/email";

/**
 * Razorpay webhook — the authoritative fallback for buyers who paid but
 * never landed back on the success page, plus the refund path that revokes
 * access. Razorpay delivers at-least-once and may retry for hours/days, so
 * every path here is idempotent:
 *   - payment.captured → created→paid transitions only; duplicate callbacks
 *     (or a race with /api/payments/verify) re-fulfil nothing and re-email
 *     nothing (markOrderPaid returns transitioned).
 *   - refund.processed/created → paid→failed transition (access revocation).
 *   - payment.failed → logged only; nothing is granted.
 * Configure in the Razorpay dashboard: POST /api/payments/webhook, secret
 * = RAZORPAY_WEBHOOK_SECRET, events: payment.captured, payment.failed,
 * refund.processed. A bad signature is always rejected before any body is
 * trusted.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  // Raw-body size guard: Razorpay payment webhooks are a few KB.
  if (raw.length > 256_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyRazorpayWebhookSignature({ secret, rawBody: raw, signature })) {
    console.warn("[webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const parsed = parseWebhookBody(raw);
  if (parsed === null) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }
  const action = classifyWebhookEvent(parsed);
  if (action.type === "reject") {
    console.warn("[webhook] rejected payload", { reason: action.reason });
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }
  if (action.type === "ignore") {
    return NextResponse.json({ ok: true, ignored: action.reason });
  }

  try {
    if (action.type === "failed") {
      // Declined payment: log for monitoring, grant nothing.
      console.info("[webhook] payment.failed", { orderId: action.orderId });
      await logEvent("payment_failed", { orderId: action.orderId });
      return NextResponse.json({ ok: true, ignored: "payment.failed" });
    }

    if (action.type === "refund") {
      // Resolve the payment → order from Razorpay (authenticated); refunds
      // only ever revoke, they never grant.
      const payment = await fetchRazorpayPayment(action.paymentId);
      if (!payment?.order_id) {
        console.warn("[webhook] refund without order mapping", { paymentId: action.paymentId });
        return NextResponse.json({ ok: true, ignored: "refund-without-order" });
      }
      const { revoked } = await revokeOrderAccess(payment.order_id);
      await logEvent("access_revoked", {
        orderId: payment.order_id,
        paymentId: payment.id,
        reason: "refund",
      });
      console.info("[webhook] refund processed", {
        orderId: payment.order_id,
        paymentId: payment.id,
        revoked,
      });
      return NextResponse.json({ ok: true });
    }

    // ── payment.captured ────────────────────────────────────────────────
    const { orderId, paymentId } = action;
    const local = await findOrderByRazorpayId(orderId);

    // Already marked paid — the verify route or an earlier webhook fulfilled
    // it. Do NOT re-email or re-issue (duplicate callback).
    if (local && local.status === "paid") {
      return NextResponse.json({ ok: true, alreadyFulfilled: true });
    }

    // Defense in depth: verify the captured amount against our own order
    // record before fulfilling anything. Only captures matching the stored
    // (server-configured) amount proceed.
    if (local?.amount_paise != null && parsed.payment?.amount != null && parsed.payment.amount !== local.amount_paise) {
      console.error("[webhook] amount mismatch; not fulfilling", {
        orderId,
        razorpay: parsed.payment.amount,
        local: local.amount_paise,
      });
      // Recognised but unactionable — 200 so Razorpay does not retry forever.
      return NextResponse.json({ ok: true, ignored: "amount-mismatch" });
    }

    const { stored, transitioned } = await markOrderPaid({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });
    if (stored && !transitioned) {
      // Another callback won the created→paid transition between our read
      // and our write; it already handled fulfillment.
      return NextResponse.json({ ok: true, alreadyFulfilled: true });
    }

    const email = (parsed.payment?.email ?? parsed.payment?.notes?.email ?? "")
      .trim()
      .toLowerCase();
    const token = createDownloadToken(
      orderId,
      DOWNLOAD_TOKEN_TTL_SECONDS,
    );
    const downloadUrl = `${WEBSITE_URL}/api/download/${orderId}?t=${token}`;
    const name = parsed.payment?.notes?.name ?? "";
    const amount = parsed.payment?.amount ?? local?.amount_paise ?? 0;

    // Best-effort deliverability: try the email first; if the provider is
    // configured but the send fails, nothing is lost — the buyer can still
    // recover via the confirmation page or support, who can resend from this
    // log entry.
    after(async () => {
      if (email) {
        const { sent } = await sendOrderPaidEmail({
          to: email,
          name,
          orderId,
          downloadUrl,
          amountRupees: Math.round(amount / 100),
        });
        if (!sent) console.warn("[webhook] fulfilment email not sent", { orderId });
      }
      await logEvent("purchase_webhook_fulfilled", { orderId });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[webhook] fulfilment failed:", error);
    // 5xx makes Razorpay retry; the retried attempts are idempotent above.
    return NextResponse.json({ error: "Fulfilment failed" }, { status: 500 });
  }
}
