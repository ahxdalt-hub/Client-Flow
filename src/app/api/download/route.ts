import { NextResponse } from "next/server";

import { getPaymentsEnv } from "@/lib/server/env";
import { decodeDownloadToken } from "@/lib/server/payment-crypto";
import {
  LINK_ISSUE_RATE_LIMIT,
  countRecentLinkIssues,
  getActiveEntitlementByPaymentId,
  recordLinkIssued,
} from "@/lib/server/fulfillment";
import { handleDownloadRequest } from "@/lib/server/download-core";
import {
  createProductSignedUrls,
  filesForEntitlement,
} from "@/lib/server/storage";

/**
 * Exchanges a short-lived HMAC download token (issued only after server-side
 * payment verification) for 10-minute signed Supabase Storage URLs.
 *
 * The decision logic — token checks, entitlement re-checks, rate limiting,
 * audit — lives in `handleDownloadRequest` so it can be unit-tested. The
 * entitlement's pinned product version determines which files are signed;
 * storage credentials and bucket names never leave this server.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const parsed = getPaymentsEnv();
  if (!parsed.ok) {
    return NextResponse.json(
      {
        state: "not_configured",
        message: "File delivery is not configured on this server yet.",
        missing: parsed.missing,
      },
      { status: 503 },
    );
  }

  const { status, body } = await handleDownloadRequest(token, {
    decodeToken: (value) =>
      decodeDownloadToken(value, parsed.env.downloadTokenSecret),
    getActiveEntitlement: getActiveEntitlementByPaymentId,
    countRecentLinkIssues,
    recordLinkIssued,
    rateLimit: LINK_ISSUE_RATE_LIMIT,
    createSignedUrls: async (entitlement) => {
      const files = await filesForEntitlement(entitlement.productVersionId);
      return createProductSignedUrls(files);
    },
  });

  const headers =
    body.state === "rate_limited"
      ? { "Retry-After": String(body.retryAfterSeconds) }
      : undefined;

  return NextResponse.json(body, { status, headers });
}
