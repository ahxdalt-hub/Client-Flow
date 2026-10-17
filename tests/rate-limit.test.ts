import assert from "node:assert/strict";
import { test } from "node:test";

import { checkRateLimit } from "../src/lib/rate-limit.ts";

/** Rate-limiter unit tests with an injectable clock. Run: npm test */

const T0 = 1_700_000_000_000;
const OPTS = { limit: 3, windowMs: 60_000 };

test("allows up to the limit within the window", () => {
  assert.equal(checkRateLimit("k1", OPTS, T0).ok, true);
  assert.equal(checkRateLimit("k1", OPTS, T0 + 1).ok, true);
  assert.equal(checkRateLimit("k1", OPTS, T0 + 2).ok, true);
});

test("blocks over the limit and reports Retry-After", () => {
  const blocked = checkRateLimit("k2", OPTS, T0 + 5_000);
  assert.equal(blocked.ok, true);
  const hit = checkRateLimit("k2", { limit: 1, windowMs: 60_000 }, T0 + 6_000);
  if (hit.ok) throw new Error("should have been blocked");
  assert.ok(hit.retryAfterSeconds > 50);
});

test("window reset with a new fixed window unblocks", () => {
  assert.equal(checkRateLimit("k3", OPTS, T0).ok, true);
  assert.equal(checkRateLimit("k3", OPTS, T0 + 1).ok, true);
  assert.equal(checkRateLimit("k3", OPTS, T0 + 2).ok, true);
  assert.equal(checkRateLimit("k3", OPTS, T0 + 3).ok, false);
  // Next window (T0 + windowMs + 1): counter resets.
  assert.equal(checkRateLimit("k3", OPTS, T0 + OPTS.windowMs + 1).ok, true);
});

test("independent keys do not interfere", () => {
  assert.equal(checkRateLimit("alice", { limit: 1, windowMs: 60_000 }, T0).ok, true);
  assert.equal(checkRateLimit("bob", { limit: 1, windowMs: 60_000 }, T0).ok, true);
  assert.equal(checkRateLimit("alice", { limit: 1, windowMs: 60_000 }, T0).ok, false);
});
