import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { DOWNLOAD_TOKEN_TTL_SECONDS } from "@/lib/config";
import { findOrderByRazorpayId, markOrderPaid, ORDER_STATUS_CREATED } from "@/lib/orders";
import { fetchDodoPayment } from "@/lib/dodo";
import { createDownloadToken, verifyDownloadToken } from "@/lib/tokens";
import { OrderSuccess } from "./order-success";

export const metadata: Metadata = {
  title: "Your download is ready",
  robots: { index: false },
};

export default function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  return (
    <div className="border-b border-line">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-5 py-24 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="mt-5 text-[0.9rem] text-muted">Confirming your order…</p>
          </div>
        }
      >
        <OrderContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderContent({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ t?: string | string[]; payment_id?: string | string[]; status?: string | string[] }>;
}) {
  // Order status is inherently per-request: opt this subtree out of
  // static prerendering so token-expiry math (Date.now) is legal here.
  await connection();

  const { orderId } = await params;
  const sp = await searchParams;
  const t = sp.t;
  const urlToken = Array.isArray(t) ? t[0] : t ?? "";
  const paymentIdParam = Array.isArray(sp.payment_id) ? sp.payment_id[0] : sp.payment_id ?? "";

  let token = urlToken;
  let status: "ready" | "pending" | "invalid" = "invalid";

  // A valid signed token in the URL always authorises a download.
  const tokenOk = verifyDownloadToken(urlToken, orderId).ok;

  try {
    const order = await findOrderByRazorpayId(orderId);
    if (!order) {
      // No row (Supabase unconfigured, or an unknown order id): fall back to
      // the signed token alone, exactly as before.
      status = tokenOk ? "ready" : "invalid";
    } else if (order.status === ORDER_STATUS_CREATED) {
      // Dodo returns the buyer here with ?payment_id=… — confirm with Dodo's
      // authenticated API (never the URL) and fulfil on the spot.
      let settled = false;
      if (order.provider === "dodo" && paymentIdParam) {
        try {
          const pay = await fetchDodoPayment(paymentIdParam);
          const matches = (pay?.metadata?.order_id ?? orderId) === orderId;
          if (pay && pay.status === "succeeded" && matches) {
            await markOrderPaid({
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentIdParam,
            });
            token = createDownloadToken(orderId, DOWNLOAD_TOKEN_TTL_SECONDS);
            status = "ready";
            settled = true;
          }
        } catch (error) {
          console.warn("[order] dodo confirm failed:", error);
        }
      }
      // Possible race: the webhook hasn't committed yet.
      if (!settled) status = "pending";
    } else if (order.status === "paid") {
      // Bookmarkable link: if the URL wasn't already signed, mint a fresh
      // token from the paid order row. This is what lets a buyer who closed
      // the tab return to /order/<orderId> and still download.
      token = tokenOk
        ? urlToken
        : createDownloadToken(orderId, DOWNLOAD_TOKEN_TTL_SECONDS);
      status = "ready";
    } else {
      // "failed" or anything else (e.g. refunded) — refuse to show the download.
      status = "invalid";
    }
  } catch {
    // Supabase unreachable — the signed token alone remains authorisation.
    status = tokenOk ? "ready" : "invalid";
  }

  return <OrderSuccess orderId={orderId} token={token} status={status} />;
}
