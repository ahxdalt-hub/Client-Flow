import { NextResponse, after } from "next/server";

import {
  activePrice,
  amountInPaise,
  DOWNLOAD_TOKEN_TTL_SECONDS,
} from "@/lib/config";
import { isRazorpayConfigured, fetchRazorpayPayment } from "@/lib/razorpay";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay-signature";
import { isRazorpayOrderId, isRazorpayPaymentId } from "@/lib/razorpay-ids";
import { createDownloadToken } from "@/lib/tokens";
import { findOrderByRazorpayId, markOrderPaid, logEvent } from "@/lib/orders";
import { PRODUCT } from "@/lib/pricing";
import { RATE_LIMITS, checkRateLimit, clientIp } from "@/lib/rate-limit";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  email?: string;
  name?: string;
};

export async function POST(request: Request) {
  const rate = checkRateLimit(`verify:${clientIp(request)}`, RATE_LIMITS.verify);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many verification attempts. Wait a moment and retry." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // IDs are pattern-checked before they reach DB lookups or fetches.
  const orderId = body.razorpay_order_id ?? "";
  const paymentId = body.razorpay_payment_id ?? "";
  const signature = body.razorpay_signature ?? "";
  if (
    !isRazorpayOrderId(orderId) ||
    !isRazorpayPaymentId(paymentId) ||
    !/^[a-f0-9]{32,64}$/.test(signature)
  ) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured on this deployment yet." },
      { status: 503 },
    );
  }

  // 1. Verify the HMAC signature Razorpay Checkout returned (server-side).
  //    A forged success URL can never pass step 2 (authenticated fetch) either.
  const ok = verifyRazorpayPaymentSignature({
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
    orderId,
    paymentId,
    signature,
  });
  if (!ok) {
    console.warn("[verify] signature mismatch", { orderId });
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  // 2. Cross-check the payment against Razorpay (authenticated), the local
  //    record when Supabase is configured, and the configured price.
  try {
    const local = await findOrderByRazorpayId(orderId);
    const row = await fetchRazorpayPayment(paymentId);

    if (!row || row.status !== "captured" || row.order_id !== orderId || row.refunded) {
      // Captured not yet committed, authorised-only, or already refunded —
      // granting access waits for server-side truth, never a client claim.
      return NextResponse.json({ error: "Payment not completed." }, { status: 400 });
    }
    if (local?.amount_paise != null) {
      if (row.amount !== local.amount_paise) {
        console.error("[verify] amount mismatch", {
          orderId,
          razorpay: row.amount,
          local: local.amount_paise,
        });
        return NextResponse.json({ error: "Order amount mismatch." }, { status: 400 });
      }
    } else if (row.amount !== amountInPaise(activePrice())) {
      // No local row (Supabase off or insert failed): the capture must still
      // match the server-configured product price.
      console.error("[verify] standalone amount mismatch", { orderId });
      return NextResponse.json({ error: "Order amount mismatch." }, { status: 400 });
    }

    // 3. Mark paid — conditional created→paid transition: if another callback
    //    (the webhook) already marked it paid, this call is a no-op
    //    (idempotency).
    await markOrderPaid({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });

    // 4. Issue the HMAC download token. Re-issuing on a repeat verify is
    //    safe: tokens share the same order id, are HMAC-signed and expire.
    const downloadToken = createDownloadToken(orderId, DOWNLOAD_TOKEN_TTL_SECONDS);

    // 5. Analytics after the response returns (non-blocking). The download
    //    link itself is returned to the buyer below and shown on the order
    //    page — nothing is emailed.
    after(async () => {
      await logEvent("purchase_complete", {
        orderId,
        product: PRODUCT.slug,
        amount: row?.amount ?? amountInPaise(activePrice()),
      });
    });

    return NextResponse.json({ ok: true, orderId, downloadToken });
  } catch (error) {
    console.error("[verify] failed:", error);
    return NextResponse.json(
      { error: "We verified your payment but couldn't finish setup — contact support with your order id and we'll sort it out." },
      { status: 500 },
    );
  }
}
