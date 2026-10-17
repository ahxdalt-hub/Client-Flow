import assert from "node:assert/strict";
import { test } from "node:test";

/**
 * Pure-logic tests for the HMAC download token flow.
 * Run: npm test  (node --test, Node ≥ 24 type stripping)
 */

const SECRET = "test-secret-for-token-unit-tests";

let created = "";

test("token roundtrip", async () => {
  process.env.DOWNLOAD_TOKEN_SECRET = SECRET;
  const mod = await import("../src/lib/tokens.ts");
  created = mod.createDownloadToken("order_123", 60);
  const verdict = mod.verifyDownloadToken(created, "order_123");
  assert.equal(verdict.ok, true);
});

test("rejects wrong order", async () => {
  process.env.DOWNLOAD_TOKEN_SECRET = SECRET;
  const mod = await import("../src/lib/tokens.ts");
  const verdict = mod.verifyDownloadToken(created, "order_999");
  assert.equal(verdict.ok, false);
});

test("rejects expired token", async () => {
  process.env.DOWNLOAD_TOKEN_SECRET = SECRET;
  const mod = await import("../src/lib/tokens.ts");
  // TTL already past: exp = now - 10
  const exp = Math.floor(Date.now() / 1000) - 10;
  const forged = `order_123.${exp}.${"x"}`;
  const verdict = mod.verifyDownloadToken(forged, "order_123");
  assert.equal(verdict.ok, false);
});

test("rejects tampered signature", async () => {
  process.env.DOWNLOAD_TOKEN_SECRET = SECRET;
  const mod = await import("../src/lib/tokens.ts");
  const exp = Math.floor(Date.now() / 1000) + 60;
  const tampered = `order_123.${exp}.AAAA`;
  const verdict = mod.verifyDownloadToken(tampered, "order_123");
  assert.equal(verdict.ok, false);
});

test("rejects malformed", async () => {
  process.env.DOWNLOAD_TOKEN_SECRET = SECRET;
  const mod = await import("../src/lib/tokens.ts");
  assert.equal(mod.verifyDownloadToken("0-0-0").ok, false);
});
