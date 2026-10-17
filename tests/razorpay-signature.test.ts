import assert from "node:assert/strict";
import { test } from "node:test";
import { createHmac } from "node:crypto";

import {
  classifyWebhookEvent,
  parseWebhookBody,
  signaturesMatch,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../src/lib/razorpay-signature.ts";

/** Phase 4 payment-security unit tests. Run: npm test */

const KEY_SECRET = "rzp_test_secret_key_for_unit_tests";
const WEBHOOK_SECRET = "whsec_unit_test_secret";
const ORDER_ID = "order_Qabc123xyz00";
const PAYMENT_ID = "pay_Qdef456uvw00";
const VALID_SIG = (secret = KEY_SECRET) =>
  createHmac("sha256", secret).update(`${ORDER_ID}|${PAYMENT_ID}`).digest("hex");

/* ── Checkout-flow signature (forged success callback) ─────────────────── */

test("payment signature: valid HMAC passes", () => {
  assert.equal(
    verifyRazorpayPaymentSignature({
      keySecret: KEY_SECRET,
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      signature: VALID_SIG(),
    }),
    true,
  );
});

test("payment signature: forged/tampered signature rejected", () => {
  assert.equal(
    verifyRazorpayPaymentSignature({
      keySecret: KEY_SECRET,
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      signature: "a".repeat(64),
    }),
    false,
  );
});

test("payment signature: attacked field (wrong order id) rejected", () => {
  assert.equal(
    verifyRazorpayPaymentSignature({
      keySecret: KEY_SECRET,
      orderId: "order_attacker",
      paymentId: PAYMENT_ID,
      signature: VALID_SIG(),
    }),
    false,
  );
});

test("payment signature: missing inputs rejected without throwing", () => {
  assert.equal(
    verifyRazorpayPaymentSignature({
      keySecret: "",
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      signature: VALID_SIG(),
    }),
    false,
  );
});

/* ── Webhook signature ──────────────────────────────────────────────────── */

const WEBHOOK_RAW = JSON.stringify({
  event: "payment.captured",
  payload: { payment: { entity: { id: PAYMENT_ID, order_id: ORDER_ID, amount: 29900 } } },
});

test("webhook signature: valid body passes", () => {
  const sig = createHmac("sha256", WEBHOOK_SECRET).update(WEBHOOK_RAW).digest("hex");
  assert.equal(
    verifyRazorpayWebhookSignature({ secret: WEBHOOK_SECRET, rawBody: WEBHOOK_RAW, signature: sig }),
    true,
  );
});

test("webhook signature: invalid signature rejected", () => {
  assert.equal(
    verifyRazorpayWebhookSignature({
      secret: WEBHOOK_SECRET,
      rawBody: WEBHOOK_RAW,
      signature: "f".repeat(64),
    }),
    false,
  );
});

test("webhook signature: body tampering changes the digest (forged capture rejected)", () => {
  const oil = WEBHOOK_RAW.replace("amount\":29900", "amount\":1");
  const sig = createHmac("sha256", WEBHOOK_SECRET).update(WEBHOOK_RAW).digest("hex");
  assert.equal(
    verifyRazorpayWebhookSignature({ secret: WEBHOOK_SECRET, rawBody: oil, signature: sig }),
    false,
  );
});

test("webhook signature: missing secret never matches", () => {
  assert.equal(
    verifyRazorpayWebhookSignature({
      secret: "",
      rawBody: WEBHOOK_RAW,
      signature: "f".repeat(64),
    }),
    false,
  );
});

/* ── Webhook classification / event routing ─────────────────────────────── */

function event(event: string, entity: Record<string, unknown>, key = "payment") {
  return parseWebhookBody(JSON.stringify({ event, payload: { [key]: { entity } } }));
}

test("classification: payment.captured fulfils", () => {
  const parsed = event("payment.captured", { id: PAYMENT_ID, order_id: ORDER_ID });
  const action = classifyWebhookEvent(parsed);
  assert.deepEqual(action, { type: "fulfil", orderId: ORDER_ID, paymentId: PAYMENT_ID });
});

test("classification: refund.processed revokes", () => {
  const parsed = event("refund.processed", { id: "rfnd_1", payment_id: PAYMENT_ID }, "refund");
  const action = classifyWebhookEvent(parsed);
  assert.deepEqual(action, { type: "refund", refundId: "rfnd_1", paymentId: PAYMENT_ID });
});

test("classification: payment.failed grants nothing", () => {
  const parsed = event("payment.failed", { id: PAYMENT_ID, order_id: ORDER_ID });
  const action = classifyWebhookEvent(parsed);
  assert.equal(action.type, "failed");
});

test("classification: duplicate payment.captured classifies identically (idempotent-by-design)", () => {
  const first = classifyWebhookEvent(
    event("payment.captured", { id: PAYMENT_ID, order_id: ORDER_ID }),
  );
  const second = classifyWebhookEvent(
    event("payment.captured", { id: PAYMENT_ID, order_id: ORDER_ID }),
  );
  assert.deepEqual(first, second);
});

test("classification: unknown events are ignored, malformed payloads rejected", () => {
  assert.equal(
    classifyWebhookEvent(event("subscription.churned", { id: "sub_1" })).type,
    "ignore",
  );
  assert.equal(classifyWebhookEvent(null).type, "reject");
  assert.equal(classifyWebhookEvent(parseWebhookBody("not json")).type, "reject");
  assert.equal(
    classifyWebhookEvent(parseWebhookBody(JSON.stringify({ payload: {} }))).type,
    "reject",
  );
  // captured event without an order id (e.g. a standalone/invoiced payment)
  // is ignored — it touches none of our orders and grants nothing.
  assert.equal(
    classifyWebhookEvent(event("payment.captured", { id: PAYMENT_ID })).type,
    "ignore",
  );
  // non-string event garbage → rejected outright
  assert.equal(
    classifyWebhookEvent(parseWebhookBody(JSON.stringify({ event: 42 }))).type,
    "reject",
  );
});

/* ── helpers ────────────────────────────────────────────────────────────── */

test("signaturesMatch: constant-time comparator handles length mismatch", () => {
  assert.equal(signaturesMatch("aaa", "aaaa"), false);
  assert.equal(signaturesMatch("", ""), true); // empty==empty (caller gates empties)
});
