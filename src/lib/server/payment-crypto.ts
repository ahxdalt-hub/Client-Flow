import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Pure cryptographic helpers for the payment flow. No environment access, no
 * framework imports — safe to unit-test with `node --test`.
 */

export function hmacSha256Hex(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data, "utf8").digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Razorpay webhook signature: hex HMAC-SHA256 of the *raw* request body with
 * the webhook secret configured in the Razorpay dashboard.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  webhookSecret: string,
): boolean {
  if (!signature || !/^[0-9a-f]+$/i.test(signature)) return false;
  const expected = hmacSha256Hex(webhookSecret, rawBody);
  return safeEqualHex(expected, signature.toLowerCase());
}

export type DownloadTokenPayload = {
  v: 1;
  /** Razorpay payment id — binds the token to one verified payment. */
  pay: string;
  /** Product id the entitlement was granted for. */
  pid: string;
  /** Unix seconds. */
  exp: number;
};

export const DOWNLOAD_TOKEN_TTL_SECONDS = 15 * 60;

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64").toString("utf8");
}

function signPayload(encodedPayload: string, secret: string): string {
  return toBase64Url(hmacSha256Hex(secret, encodedPayload));
}

export function encodeDownloadToken(
  payload: DownloadTokenPayload,
  secret: string,
): string {
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${signPayload(encoded, secret)}`;
}

export type DecodeDownloadTokenResult =
  | { ok: true; payload: DownloadTokenPayload }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

export function decodeDownloadToken(
  token: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): DecodeDownloadTokenResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [encoded, signature] = parts;
  if (!encoded || !signature) return { ok: false, reason: "malformed" };

  const expected = signPayload(encoded, secret);
  let signatureMatches = false;
  try {
    signatureMatches = timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    signatureMatches = false;
  }
  if (!signatureMatches) return { ok: false, reason: "bad_signature" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(encoded));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as DownloadTokenPayload).v !== 1 ||
    typeof (parsed as DownloadTokenPayload).pay !== "string" ||
    typeof (parsed as DownloadTokenPayload).pid !== "string" ||
    typeof (parsed as DownloadTokenPayload).exp !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }

  const payload = parsed as DownloadTokenPayload;
  if (payload.exp <= nowSeconds) return { ok: false, reason: "expired" };
  return { ok: true, payload };
}
