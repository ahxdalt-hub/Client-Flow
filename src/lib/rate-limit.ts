/**
 * Fixed-window rate limiter for public POST endpoints (checkout, verify,
 * track). Pure state + injectable clock so `node --test` can drive it.
 *
 * Scope caveat (documented in docs/PAYMENTS.md): state is per-process memory.
 * On serverless this limits per warm instance, not globally — it blunts
 * bursts and abuse but is not a substitute for an edge/Redis limiter if the
 * store is ever attacked at volume. Wire in an Upstash/Vercel KV adapter
 * behind the same function signature when needed.
 */

export const RATE_LIMITS = {
  /** Buyer-initiated checkouts: generous for retries, tight for bots. */
  checkout: { limit: 10, windowMs: 10 * 60 * 1000 },
  /** Payment verification: a few retries per real payment. */
  verify: { limit: 30, windowMs: 10 * 60 * 1000 },
  /** First-party analytics beacon. */
  track: { limit: 120, windowMs: 10 * 60 * 1000 },
  /** Self-serve download-link recovery: looks up a paid order by Razorpay id. */
  recover: { limit: 20, windowMs: 10 * 60 * 1000 },
  /** Owner-dashboard login: a handful of attempts, then locked out. */
  admin: { limit: 10, windowMs: 10 * 60 * 1000 },
} as const;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
/** Keeps a memory-overflow attacker from growing the map without bound. */
const MAX_BUCKETS = 10_000;

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
  now: number = Date.now(),
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const existing = buckets.get(key);
  if (existing && existing.resetAt > now) {
    existing.count += 1;
    if (existing.count > options.limit) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }
    return { ok: true };
  }

  if (buckets.size >= MAX_BUCKETS) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k);
    }
    if (buckets.size >= MAX_BUCKETS) {
      buckets.clear(); // degenerate case: fail open rather than OOM
    }
  }

  buckets.set(key, { count: 1, resetAt: now + options.windowMs });
  return { ok: true };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
