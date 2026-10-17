import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Owner-dashboard access — a single shared secret, no accounts.
 *
 * There is no user system here on purpose: the store has one operator. Access
 * is gated by ADMIN_SECRET (env). The browser holds a SHA-256 derivation of the
 * secret in an httpOnly cookie, never the secret itself. Pure node:crypto only
 * (no "server-only") so `node --test` can cover it.
 */

export const ADMIN_COOKIE = "cf_admin";

/** Minimum length we accept for ADMIN_SECRET. */
export const ADMIN_SECRET_MIN_LENGTH = 8;

export function adminSecret(): string {
  return process.env.ADMIN_SECRET ?? "";
}

export function isAdminConfigured(): boolean {
  return adminSecret().length >= ADMIN_SECRET_MIN_LENGTH;
}

/** Deterministic, non-reversible cookie value derived from the secret. */
export function adminCookieValue(secret: string): string {
  return createHash("sha256").update(`clientflow-admin:${secret}`).digest("hex");
}

/** Constant-time string compare that tolerates length mismatch. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** True when a presented plaintext secret matches the configured one. */
export function isValidAdminSecret(secret: string): boolean {
  const configured = adminSecret();
  if (configured.length < ADMIN_SECRET_MIN_LENGTH) return false;
  return safeEqual(secret, configured);
}

/** True when the cookie presented by the browser is the expected derivation. */
export function isValidAdminCookie(value: string | undefined | null): boolean {
  const configured = adminSecret();
  if (configured.length < ADMIN_SECRET_MIN_LENGTH || !value) return false;
  return safeEqual(value, adminCookieValue(configured));
}
