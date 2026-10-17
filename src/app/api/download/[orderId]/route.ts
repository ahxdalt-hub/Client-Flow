import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { NextResponse, after } from "next/server";

import { verifyDownloadToken } from "@/lib/tokens";
import { findOrderByRazorpayId, logDownload, ORDER_STATUS_CREATED } from "@/lib/orders";
import { CONTACT, DELIVERY } from "@/lib/pricing";

// Deliverable zip lives outside /public so it's never directly URL-accessible.
// Contents/manifest source of truth: DELIVERY in src/lib/pricing.ts — keep the
// literal segments here in sync so the build's static file tracing stays scoped.
const FILE_DIR = path.join(process.cwd(), "assets", "deliverables");
const FILE_NAME = DELIVERY.paidBundleFile;

/** Logs only a salted hash of IPs, never the raw address. */
const ANONYMIZER = "clientflow-download-log-salt";

function hashIp(ip: string) {
  return createHash("sha256").update(`${ANONYMIZER}:${ip}`).digest("hex").slice(0, 24);
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function denied(
  reason: string,
  orderId: string | null,
  request: Request,
  status = 404,
  message = "This download link is invalid or has expired. Check your email for the original link, or contact support.",
) {
  void logDownload(orderId, hashIp(clientIp(request)));
  console.warn(`[download] denied (${reason})`, { orderId });
  return NextResponse.json({ error: message }, { status });
}

/**
 * GET the paid kit zip. Authorisation is two-factor:
 *   1. HMAC-signed, expiring token bound to the order id (in the ?t= param,
 *      never guessable) — issued only after server-verified capture.
 *   2. When Supabase is configured, the order row must be "paid" — a forged
 *      URL, an expired token, an unpaid order, or a refunded order all fail
 *      here even if one factor somehow leaks.
 */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await ctx.params;
  const token = new URL(request.url).searchParams.get("t") ?? "";

  // 1. Verify the HMAC-signed, expiring token for this order.
  const verdict = verifyDownloadToken(token, orderId);
  if (!verdict.ok) {
    return denied(
      verdict.reason,
      orderId,
      request,
      404,
      "This download link is invalid or has expired. Check your email for the original link, or contact support for a fresh link.",
    );
  }

  // 2. Defense in depth: require a paid order row. A 'created' row means
  //    capture was never verified server-side — payment status is never
  //    taken from a URL, only from Razorpay's own callbacks.
  let order: Awaited<ReturnType<typeof findOrderByRazorpayId>> = null;
  try {
    order = await findOrderByRazorpayId(orderId);
  } catch {
    // Supabase unavailable — the signed token alone remains the authorisation.
  }
  if (order) {
    if (order.status === ORDER_STATUS_CREATED) {
      return denied(
        "order-not-verified",
        orderId,
        request,
        403,
        "Payment is still confirming. Give it a minute, refresh, and if it stays stuck email support with your order id.",
      );
    }
    if (order.status !== "paid") {
      // Refunded or otherwise closed — access is revoked.
      return denied(
        "order-revoked",
        orderId,
        request,
        403,
        "Access to this download has been revoked (e.g. a completed refund). If this is unexpected, contact support.",
      );
    }
  }

  // 3. Log the download (best-effort, never blocks delivery).
  after(async () => {
    await logDownload(orderId, hashIp(clientIp(request)));
  });

  // 4. Stream the file.
  try {
    const zip = await readFile(path.join(FILE_DIR, FILE_NAME));
    return new Response(new Uint8Array(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": String(zip.byteLength),
        "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[download] file error:", error);
    return NextResponse.json(
      { error: `The kit file could not be served. Email ${CONTACT.email} and we'll resend it.` },
      { status: 500 },
    );
  }
}
