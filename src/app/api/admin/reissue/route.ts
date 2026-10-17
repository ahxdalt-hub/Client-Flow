import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin-auth";
import { DOWNLOAD_TOKEN_TTL_SECONDS } from "@/lib/config";
import { findPaidOrderByReference } from "@/lib/orders";
import { parseRazorpayReference } from "@/lib/razorpay-ids";
import { createDownloadToken } from "@/lib/tokens";

/**
 * Admin-only: mint a fresh signed download link for a paid order. Cookie-gated
 * (same shared secret as /admin) and never grants access for an unpaid order.
 */
export async function POST(request: Request) {
  const authed = isValidAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  let reference = "";
  try {
    const body = (await request.json()) as { reference?: string };
    reference = body.reference ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseRazorpayReference(reference);
  if (!parsed) {
    return NextResponse.json(
      { error: "Enter a Razorpay order_ or pay_ id." },
      { status: 400 },
    );
  }

  try {
    const order = await findPaidOrderByReference(parsed.value);
    if (!order?.provider_order_id) {
      return NextResponse.json(
        { error: "No paid order found for that id." },
        { status: 404 },
      );
    }
    const downloadToken = createDownloadToken(
      order.provider_order_id,
      DOWNLOAD_TOKEN_TTL_SECONDS,
    );
    return NextResponse.json({
      ok: true,
      orderId: order.provider_order_id,
      downloadToken,
      url: `/api/download/${order.provider_order_id}?t=${downloadToken}`,
    });
  } catch (error) {
    console.error("[admin] reissue failed:", error);
    return NextResponse.json({ error: "Could not reissue the link." }, { status: 500 });
  }
}
