import { NextResponse } from "next/server";

import { DOWNLOAD_TOKEN_TTL_SECONDS } from "@/lib/config";
import { findPaidOrderByReference, isSupabaseConfigured } from "@/lib/orders";
import { parseRazorpayReference } from "@/lib/razorpay-ids";
import { createDownloadToken } from "@/lib/tokens";
import { RATE_LIMITS, checkRateLimit, clientIp } from "@/lib/rate-limit";

type RecoverBody = { reference?: string };

/**
 * Self-serve download recovery. A buyer who closed the confirmation tab pastes
 * the Razorpay order/payment id from their payment receipt; if the order is
 * paid we mint a fresh signed download token. No email is involved.
 *
 * The ids are unguessable Razorpay references — the same "secret link" trust
 * model as an emailed link would be — so this only ever returns a link the
 * buyer would have received anyway. Rate-limited, and it never reveals why a
 * lookup failed beyond "not found".
 */
export async function POST(request: Request) {
  const rate = checkRateLimit(`recover:${clientIp(request)}`, RATE_LIMITS.recover);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  let body: RecoverBody;
  try {
    body = (await request.json()) as RecoverBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseRazorpayReference(body.reference ?? "");
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "That doesn't look like a Razorpay id. It starts with order_ or pay_ — check your payment receipt.",
      },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Link recovery isn't available on this deployment. Email support with your order id and we'll reissue it.",
      },
      { status: 503 },
    );
  }

  try {
    const order = await findPaidOrderByReference(parsed.value);
    if (!order?.provider_order_id) {
      return NextResponse.json(
        {
          error:
            "We couldn't find a completed purchase for that id. Double-check it, or email support and we'll sort it out.",
        },
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
    });
  } catch (error) {
    console.error("[recover] failed:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong reissuing your link. Email support with your order id and we'll do it manually.",
      },
      { status: 500 },
    );
  }
}
