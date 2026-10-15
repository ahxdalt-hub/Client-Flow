/**
 * Download-token → signed-URL exchange, extracted from the route so the
 * security-critical behaviour (token checks, entitlement re-checks, rate
 * limiting, path resolution) can be unit-tested with fakes.
 *
 * The caller injects every dependency; no secrets, storage paths, or database
 * clients are read here.
 */

import type { DecodeDownloadTokenResult } from "./payment-crypto.ts";
import type { ActiveEntitlement } from "./fulfillment-types.ts";

export type SignedProductFile = {
  name: string;
  url: string;
  expiresAt: string;
};

export type SignedUrlsResult =
  | { ok: true; files: SignedProductFile[]; expiresAt: string }
  | { ok: false; reason: "not_configured" | "file_missing" | "storage_error" };

export type DownloadDeps = {
  decodeToken: (token: string) => DecodeDownloadTokenResult;
  getActiveEntitlement: (
    paymentId: string,
  ) => Promise<ActiveEntitlement | null>;
  countRecentLinkIssues: (entitlementId: string) => Promise<number>;
  recordLinkIssued: (entitlementId: string) => Promise<void>;
  rateLimit: { maxPerWindow: number; windowSeconds: number };
  /** Resolves the expected product/version files for this entitlement. */
  createSignedUrls: (entitlement: ActiveEntitlement) => Promise<SignedUrlsResult>;
};

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

export type DownloadResult = {
  status: number;
  body: DownloadResponse;
};

/**
 * Handles one download-link request.
 *
 * - The HMAC token is signature-checked first (expired vs invalid are
 *   distinguished so the UI can offer a retry).
 * - The entitlement is re-checked in the database on every request, so a
 *   refund revokes access immediately and a forged token never yields files.
 * - Link issuance is rate-limited per entitlement and audited with minimal
 *   data (entitlement id + timestamp only).
 */
export async function handleDownloadRequest(
  token: string | null,
  deps: DownloadDeps,
): Promise<DownloadResult> {
  if (!token) {
    return {
      status: 400,
      body: { state: "missing_token", message: "A download token is required." },
    };
  }

  const decoded = deps.decodeToken(token);
  if (!decoded.ok) {
    if (decoded.reason === "expired") {
      return {
        status: 401,
        body: {
          state: "expired_token",
          message:
            "This download link has expired. Request a fresh link from the success page.",
        },
      };
    }
    return {
      status: 401,
      body: {
        state: "invalid_token",
        message: "This download link is not valid.",
      },
    };
  }

  try {
    const entitlement = await deps.getActiveEntitlement(decoded.payload.pay);
    if (!entitlement) {
      return {
        status: 403,
        body: {
          state: "no_entitlement",
          message:
            "No active entitlement was found for this payment. If you paid and were refunded, this is expected. Otherwise contact support with your payment id.",
        },
      };
    }

    const recentIssues = await deps.countRecentLinkIssues(entitlement.entitlementId);
    if (recentIssues >= deps.rateLimit.maxPerWindow) {
      const retryAfterSeconds = deps.rateLimit.windowSeconds;
      return {
        status: 429,
        body: {
          state: "rate_limited",
          message:
            "Too many download links were requested recently. Please wait before trying again, or contact support.",
          retryAfterSeconds,
        },
      };
    }

    const signed = await deps.createSignedUrls(entitlement);
    if (!signed.ok) {
      if (signed.reason === "not_configured") {
        return {
          status: 503,
          body: {
            state: "not_configured",
            message: "File delivery is not configured on this server yet.",
          },
        };
      }
      if (signed.reason === "file_missing") {
        return {
          status: 503,
          body: {
            state: "file_missing",
            message:
              "The product files are not available yet. Your purchase is recorded — please contact support and we will deliver them directly.",
          },
        };
      }
      return {
        status: 502,
        body: {
          state: "storage_error",
          message: "Could not create download links right now. Please retry.",
        },
      };
    }

    await deps.recordLinkIssued(entitlement.entitlementId);

    return {
      status: 200,
      body: {
        state: "ready",
        files: signed.files,
        expiresAt: signed.expiresAt,
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        state: "storage_error",
        message: "Could not create download links right now. Please retry.",
      },
    };
  }
}
