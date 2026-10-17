import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { findOrderByRazorpayId, ORDER_STATUS_CREATED } from "@/lib/orders";
import { verifyDownloadToken } from "@/lib/tokens";
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
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  // Order status is inherently per-request: opt this subtree out of
  // static prerendering so token-expiry math (Date.now) is legal here.
  await connection();

  const { orderId } = await params;
  const t = (await searchParams).t;
  const token = Array.isArray(t) ? t[0] : t ?? "";

  // Resolve status fully before rendering JSX (no JSX inside try/catch).
  let status: "ready" | "pending" | "invalid" = verifyDownloadToken(token, orderId)
    .ok
    ? "ready"
    : "invalid";

  if (status === "ready") {
    try {
      const order = await findOrderByRazorpayId(orderId);
      if (!order || order.status === ORDER_STATUS_CREATED) {
        // Possible race: verification/webhook hasn't committed yet.
        status = "pending";
      } else if (order.status !== "paid") {
        // "failed" or anything else — refuse to show the download.
        status = "invalid";
      }
    } catch {
      // Supabase unreachable — the signed token alone is valid authorisation.
    }
  }

  return <OrderSuccess orderId={orderId} token={token} status={status} />;
}
