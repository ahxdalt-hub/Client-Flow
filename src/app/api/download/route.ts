import { NextResponse } from "next/server";

import { getPaymentsEnv } from "@/lib/server/env";
import { decodeDownloadToken } from "@/lib/server/payment-crypto";
import {
  LINK_ISSUE_RATE_LIMIT,
  countRecentLinkIssues,
  getActiveEntitlementByPaymentId,
  recordLinkIssued,
} from "@/lib/server/fulfillment";
import {
  createProductSignedUrls,
  type SignedProductFile,
} from "@/lib/server/storage";



export type DownloadResponse =
  | {
      state: "ready";
      files: SignedProductFile[];
      expiresAt: string;
    }
  | {
      state:
        | "missing_token"
        | "invalid_token"
        | "expired_token"
        | "no_entitlement"
        | "not_configured"
        | "file_missing"
        | "storage_error";
      message: string;
      missing?: string[];
      retryAfterSeconds?: number;
    }
  | { state: "rate_limited"; message: string; retryAfterSeconds: number };

/**
 * Exchanges a short-lived HMAC download token (issued only after server-side
 * payment verification) for 10-minute signed Supabase Storage URLs.
 *
 * - The token is signature-checked, then the entitlement is re-checked in the
 *   database on every request (revoked purchases stop working immediately).
 * - Link issuance is rate-limited per entitlement and audited with minimal
 *   data (entitlement id + timestamp only).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const parsed = getPaymentsEnv();
  if (!parsed.ok) {
    return NextResponse.json<DownloadResponse>(
      {
        state: "not_configured",
        message: "File delivery is not configured on this server yet.",
        missing: parsed.missing,
      },
      { status: 503 },
    );
  }

  if (!token) {
    return NextResponse.json<DownloadResponse>(
      { state: "missing_token", message: "A download token is required." },
      { status: 400 },
    );
  }

  const decoded = decodeDownloadToken(token, parsed.env.downloadTokenSecret);
  if (!decoded.ok) {
    if (decoded.reason === "expired") {
      return NextResponse.json<DownloadResponse>(
        {
          state: "expired_token",
          message:
            "This download link has expired. Request a fresh link from the success page.",
        },
        { status: 401 },
      );
    }
    return NextResponse.json<DownloadResponse>(
      { state: "invalid_token", message: "This download link is not valid." },
      { status: 401 },
    );
  }

  try {
    const entitlement = await getActiveEntitlementByPaymentId(
      decoded.payload.pay,
    );
    if (!entitlement) {
      return NextResponse.json<DownloadResponse>(
        {
          state: "no_entitlement",
          message:
            "No active entitlement was found for this payment. If you paid and were refunded, this is expected. Otherwise contact support with your payment id.",
        },
        { status: 403 },
      );
    }

    const recentIssues = await countRecentLinkIssues(entitlement.entitlementId);
    if (recentIssues >= LINK_ISSUE_RATE_LIMIT.maxPerWindow) {
      const retryAfterSeconds = LINK_ISSUE_RATE_LIMIT.windowSeconds;
      return NextResponse.json<DownloadResponse>(
        {
          state: "rate_limited",
          message:
            "Too many download links were requested recently. Please wait before trying again, or contact support.",
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        },
      );
    }

    const signed = await createProductSignedUrls();
    if (!signed.ok) {
      if (signed.reason === "not_configured") {
        return NextResponse.json<DownloadResponse>(
          {
            state: "not_configured",
            message: "File delivery is not configured on this server yet.",
          },
          { status: 503 },
        );
      }
      if (signed.reason === "file_missing") {
        return NextResponse.json<DownloadResponse>(
          {
            state: "file_missing",
            message:
              "The product files are not available yet. Your purchase is recorded — please contact support and we will deliver them directly.",
          },
          { status: 503 },
        );
      }
      return NextResponse.json<DownloadResponse>(
        {
          state: "storage_error",
          message: "Could not create download links right now. Please retry.",
        },
        { status: 502 },
      );
    }

    await recordLinkIssued(entitlement.entitlementId);

    return NextResponse.json<DownloadResponse>({
      state: "ready",
      files: signed.files,
      expiresAt: signed.expiresAt,
    });
  } catch (error) {
    console.error("[download] error:", error);
    return NextResponse.json<DownloadResponse>(
      {
        state: "storage_error",
        message: "Could not create download links right now. Please retry.",
      },
      { status: 500 },
    );
  }
}
