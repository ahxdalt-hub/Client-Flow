import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HMAC-signed download tokens, verified server-side before any file is streamed.
 * Token format: `<orderId>.<expiryUnix>.<hmac>` — base64url, no server state needed.
 * Intentionally dependency-free (no "server-only" guard) so it is unit-testable:
 * it contains no secrets itself and is only ever called from server code.
 */

const secret =
  process.env.DOWNLOAD_TOKEN_SECRET ?? process.env.DOWNLOAD_TOKENS_SECRET;

const hmac = (payload: string) =>
  createHmac("sha256", secret ?? "").update(payload).digest("base64url");

export function createDownloadToken(orderId: string, ttlSeconds: number) {
  if (!secret) throw new Error("DOWNLOAD_TOKEN_SECRET is not configured");
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = hmac(`${orderId}.${exp}`);
  return `${orderId}.${exp}.${sig}`;
}

export function verifyDownloadToken(
  token: string,
  expectedOrderId?: string,
): { ok: true; orderId: string } | { ok: false; reason: string } {
  if (!secret) return { ok: false, reason: "server-misconfigured" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };

  const [orderId, expRaw, sig] = parts;
  if (expectedOrderId && orderId !== expectedOrderId) {
    return { ok: false, reason: "order-mismatch" };
  }

  const exp = Number.parseInt(expRaw, 10);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const expected = hmac(`${orderId}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid-signature" };
  }

  return { ok: true, orderId };
}
