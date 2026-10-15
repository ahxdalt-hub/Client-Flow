import { NextResponse } from "next/server";

import { CHECKOUT, PRODUCT, SITE } from "@/config/site";
import { getPaymentsEnv } from "@/lib/server/env";
import { createRazorpayOrder } from "@/lib/server/razorpay";
import { EXPECTED_AMOUNT_PAISE, EXPECTED_CURRENCY } from "@/lib/server/fulfillment";
import { getAdminClient } from "@/lib/server/db";



function receiptId(): string {
  return `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Creates a Razorpay order server-side and returns the publishable checkout
 * parameters. Amount, currency, and product are fixed server-side — the
 * client cannot influence what it pays for. Secrets never leave the server.
 */
export async function POST() {
  const parsed = getPaymentsEnv();
  if (!parsed.ok) {
    return NextResponse.json(
      {
        state: "not_configured",
        missing: parsed.missing,
        message: "Checkout is not configured on this server yet.",
      },
      { status: 503 },
    );
  }

  try {
    const order = await createRazorpayOrder(
      {
        keyId: parsed.env.razorpayKeyId,
        keySecret: parsed.env.razorpayKeySecret,
      },
      {
        amountPaise: EXPECTED_AMOUNT_PAISE,
        currency: EXPECTED_CURRENCY,
        receipt: receiptId(),
        notes: {
          product_id: PRODUCT.id,
          site: SITE.name,
        },
      },
    );

    // Best-effort attempt record for accounting. The webhook and /api/verify
    // both create/update this row idempotently if this insert is skipped.
    const supabase = getAdminClient();
    if (supabase) {
      const { error } = await supabase.from("orders").upsert(
        {
          provider: CHECKOUT.provider,
          provider_order_id: order.id,
          product_id: PRODUCT.id,
          status: "created",
          amount_paise: EXPECTED_AMOUNT_PAISE,
          currency: EXPECTED_CURRENCY,
        },
        { onConflict: "provider,provider_order_id", ignoreDuplicates: true },
      );
      if (error) {
        console.error("[checkout] order record insert failed:", error.message);
      }
    }

    return NextResponse.json({
      state: "ok",
      keyId: parsed.env.razorpayKeyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: PRODUCT.name,
      description: `${PRODUCT.name} — one-time digital download`,
    });
  } catch (error) {
    console.error("[checkout] order creation failed:", error);
    return NextResponse.json(
      {
        state: "checkout_error",
        message: "Could not start checkout. Please try again.",
      },
      { status: 502 },
    );
  }
}
