import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import {
  DOWNLOAD_TOKEN_TTL_SECONDS,
  decodeDownloadToken,
  encodeDownloadToken,
  verifyRazorpayWebhookSignature,
  type DownloadTokenPayload,
} from "./payment-crypto.ts";

const SECRET = "test-secret-with-at-least-32-characters-long";
const OTHER_SECRET = "another-secret-with-at-least-32-characters!";

describe("verifyRazorpayWebhookSignature", () => {
  const body = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_ABC123" } } },
  });

  it("accepts a valid signature for the raw body", () => {
    const signature = createHmac("sha256", SECRET)
      .update(body, "utf8")
      .digest("hex");
    assert.equal(verifyRazorpayWebhookSignature(body, signature, SECRET), true);
  });

  it("rejects a signature computed over a different body", () => {
    const signature = createHmac("sha256", SECRET)
      .update(`${body} `, "utf8")
      .digest("hex");
    assert.equal(verifyRazorpayWebhookSignature(body, signature, SECRET), false);
  });

  it("rejects a signature computed with a different secret", () => {
    const signature = createHmac("sha256", OTHER_SECRET)
      .update(body, "utf8")
      .digest("hex");
    assert.equal(verifyRazorpayWebhookSignature(body, signature, SECRET), false);
  });

  it("rejects missing, empty, and non-hex signatures", () => {
    assert.equal(verifyRazorpayWebhookSignature(body, null, SECRET), false);
    assert.equal(verifyRazorpayWebhookSignature(body, "", SECRET), false);
    assert.equal(
      verifyRazorpayWebhookSignature(body, "not-hex!!", SECRET),
      false,
    );
  });

  it("accepts uppercase hex signatures", () => {
    const signature = createHmac("sha256", SECRET)
      .update(body, "utf8")
      .digest("hex")
      .toUpperCase();
    assert.equal(verifyRazorpayWebhookSignature(body, signature, SECRET), true);
  });
});

describe("download tokens", () => {
  const now = 1_700_000_000;
  const payload: DownloadTokenPayload = {
    v: 1,
    pay: "pay_ABC123",
    pid: "marketloom-research-pack",
    exp: now + DOWNLOAD_TOKEN_TTL_SECONDS,
  };

  it("round-trips a valid token", () => {
    const token = encodeDownloadToken(payload, SECRET);
    const result = decodeDownloadToken(token, SECRET, now);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.payload, payload);
    }
  });

  it("rejects a token signed with a different secret", () => {
    const token = encodeDownloadToken(payload, OTHER_SECRET);
    const result = decodeDownloadToken(token, SECRET, now);
    assert.deepEqual(result, { ok: false, reason: "bad_signature" });
  });

  it("rejects a tampered payload", () => {
    const token = encodeDownloadToken(payload, SECRET);
    const [, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...payload, pay: "pay_OTHER" }),
      "utf8",
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const result = decodeDownloadToken(`${forged}.${signature}`, SECRET, now);
    assert.equal(result.ok, false);
  });

  it("rejects an expired token", () => {
    const token = encodeDownloadToken(payload, SECRET);
    const result = decodeDownloadToken(
      token,
      SECRET,
      payload.exp, // exp <= now counts as expired
    );
    assert.deepEqual(result, { ok: false, reason: "expired" });
  });

  it("rejects malformed tokens", () => {
    assert.deepEqual(decodeDownloadToken("", SECRET, now), {
      ok: false,
      reason: "malformed",
    });
    assert.deepEqual(decodeDownloadToken("a.b.c", SECRET, now), {
      ok: false,
      reason: "malformed",
    });
    assert.deepEqual(decodeDownloadToken("nodot", SECRET, now), {
      ok: false,
      reason: "malformed",
    });
    const badJson = Buffer.from("not-json", "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const sigHex = createHmac("sha256", SECRET).update(badJson).digest("hex");
    const sigB64 = Buffer.from(sigHex, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    assert.deepEqual(decodeDownloadToken(`${badJson}.${sigB64}`, SECRET, now), {
      ok: false,
      reason: "malformed",
    });
  });
});
