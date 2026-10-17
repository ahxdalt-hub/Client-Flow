import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isRazorpayOrderId,
  isRazorpayPaymentId,
  parseRazorpayReference,
} from "../src/lib/razorpay-ids.ts";

/**
 * Pure-logic tests for the Razorpay id guards used by /api/payments/verify
 * and the /recover lookup. Run: npm test
 */

test("accepts real-shaped Razorpay ids", () => {
  assert.equal(isRazorpayOrderId("order_ToeXK0uSLGxLg0"), true);
  assert.equal(isRazorpayPaymentId("pay_MrFvQ2sT2Zv9Xa"), true);
  assert.equal(isRazorpayOrderId("order_abcd"), true);
  assert.equal(isRazorpayPaymentId("pay_ABCD1234"), true);
});

test("rejects wrong prefix or short tail", () => {
  assert.equal(isRazorpayOrderId("pay_abc123"), false);
  assert.equal(isRazorpayPaymentId("order_abc123"), false);
  assert.equal(isRazorpayOrderId("order_abc"), false); // tail < 4
  assert.equal(isRazorpayOrderId("order_"), false);
  assert.equal(isRazorpayPaymentId("pay_"), false);
  assert.equal(isRazorpayOrderId(""), false);
});

test("rejects ids carrying junk or injection characters", () => {
  assert.equal(isRazorpayOrderId("order_abc-123"), false);
  assert.equal(isRazorpayPaymentId("pay_abc 123"), false);
  assert.equal(isRazorpayOrderId("order_abc123; DROP TABLE orders"), false);
  assert.equal(isRazorpayPaymentId("pay_abc/../other"), false);
});

test("classifies and trims references", () => {
  assert.deepEqual(parseRazorpayReference("  order_abcd  "), {
    kind: "order",
    value: "order_abcd",
  });
  assert.deepEqual(parseRazorpayReference("pay_abcd"), {
    kind: "payment",
    value: "pay_abcd",
  });
});

test("returns null for non-ids", () => {
  assert.equal(parseRazorpayReference("customer@example.com"), null);
  assert.equal(parseRazorpayReference(""), null);
  assert.equal(parseRazorpayReference("ABCD-1234"), null);
});
