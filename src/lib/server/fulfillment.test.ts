import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { __setAdminClientForTests } from "./db.ts";
import {
  countRecentLinkIssues,
  getActiveEntitlementByPaymentId,
  getProductVersionById,
  markPaymentCaptured,
  recordLinkIssued,
  recordPaymentFailed,
  revokeEntitlementForPayment,
} from "./fulfillment.ts";
import { createFakeDb, createFakeSupabase } from "../../test-support/fake-supabase.ts";

const capturedInput = {
  providerOrderId: "order_TEST1",
  providerPaymentId: "pay_TEST1",
  amountPaise: 19900,
  currency: "INR",
  productId: "marketloom-research-pack",
  paidAtIso: "2026-10-15T10:00:00.000Z",
};

describe("markPaymentCaptured idempotency", () => {
  const db = createFakeDb();

  beforeEach(() => {
    db.orders.length = 0;
    db.entitlements.length = 0;
    db.download_events.length = 0;
    db.product_versions.length = 0;
    __setAdminClientForTests(createFakeSupabase(db) as never);
  });

  afterEach(() => {
    __setAdminClientForTests(null);
  });

  it("creates exactly one order and one entitlement per payment", async () => {
    const first = await markPaymentCaptured(capturedInput);
    assert.equal(first.ok, true);

    const second = await markPaymentCaptured(capturedInput);
    assert.equal(second.ok, true);

    if (first.ok && second.ok) {
      assert.equal(first.firstFulfillment, true);
      assert.equal(second.firstFulfillment, false);
      assert.equal(first.orderId, second.orderId);
      assert.equal(first.entitlementId, second.entitlementId);
    }

    assert.equal(db.orders.length, 1);
    assert.equal(db.entitlements.length, 1);
    assert.equal(db.orders[0]?.status, "paid");
    assert.equal(db.orders[0]?.provider_payment_id, "pay_TEST1");
    assert.equal(db.entitlements[0]?.order_id, db.orders[0]?.id);
  });

  it("finalises a checkout-created order row instead of duplicating it", async () => {
    db.orders.push({
      id: "order-row-1",
      provider: "razorpay",
      provider_order_id: "order_TEST1",
      provider_payment_id: null,
      product_id: "marketloom-research-pack",
      status: "created",
      amount_paise: 19900,
      currency: "INR",
    });

    const result = await markPaymentCaptured(capturedInput);
    assert.equal(result.ok, true);
    assert.equal(db.orders.length, 1);
    assert.equal(db.orders[0]?.status, "paid");
    assert.equal(db.orders[0]?.provider_payment_id, "pay_TEST1");
  });

  it("rejects amount and currency mismatches without writing anything", async () => {
    const wrongAmount = await markPaymentCaptured({
      ...capturedInput,
      amountPaise: 100,
    });
    assert.equal(wrongAmount.ok, false);
    if (!wrongAmount.ok) assert.equal(wrongAmount.reason, "amount_mismatch");

    const wrongCurrency = await markPaymentCaptured({
      ...capturedInput,
      currency: "USD",
    });
    assert.equal(wrongCurrency.ok, false);
    if (!wrongCurrency.ok) {
      assert.equal(wrongCurrency.reason, "currency_mismatch");
    }

    assert.equal(db.orders.length, 0);
    assert.equal(db.entitlements.length, 0);
  });

  it("pins the entitlement to the current product version when available", async () => {
    db.product_versions.push({
      id: "version-1",
      product_id: "marketloom-research-pack",
      version: "v1",
      csv_path: "marketloom/v1/marketloom-shopify-research-v1.csv",
      xlsx_path: "marketloom/v1/marketloom-shopify-research-v1.xlsx",
      record_count: 100,
      is_current: true,
    });

    const result = await markPaymentCaptured(capturedInput);
    assert.equal(result.ok, true);
    assert.equal(db.entitlements[0]?.product_version_id, "version-1");

    const version = await getProductVersionById("version-1");
    assert.equal(version?.version, "v1");
    assert.equal(version?.csvPath, "marketloom/v1/marketloom-shopify-research-v1.csv");
    assert.equal(version?.recordCount, 100);
  });

  it("leaves the entitlement unpinned when the version table is empty", async () => {
    const result = await markPaymentCaptured(capturedInput);
    assert.equal(result.ok, true);
    assert.equal(db.entitlements[0]?.product_version_id, null);
  });
});

describe("payment failure and refund handling", () => {
  const db = createFakeDb();

  beforeEach(() => {
    db.orders.length = 0;
    db.entitlements.length = 0;
    db.download_events.length = 0;
    __setAdminClientForTests(createFakeSupabase(db) as never);
  });

  afterEach(() => {
    __setAdminClientForTests(null);
  });

  it("records failures but never downgrades a paid order", async () => {
    await markPaymentCaptured(capturedInput);
    await recordPaymentFailed({
      providerOrderId: "order_TEST1",
      providerPaymentId: "pay_OTHER",
    });
    assert.equal(db.orders.length, 1);
    assert.equal(db.orders[0]?.status, "paid");

    // A failed payment for an unknown order is a no-op: only the checkout
    // route creates `created` rows, and only capture creates `paid` rows.
    // FAILED events just mark the checkout attempt row if it exists.
    db.orders.length = 0;
    db.entitlements.length = 0;
    await recordPaymentFailed({
      providerOrderId: "order_TEST2",
      providerPaymentId: "pay_TEST2",
    });
    assert.equal(db.orders.length, 0);
    assert.equal(db.entitlements.length, 0);
  });

  it("revokes the entitlement on refund and blocks further access", async () => {
    await markPaymentCaptured(capturedInput);
    const before = await getActiveEntitlementByPaymentId("pay_TEST1");
    assert.ok(before);

    await revokeEntitlementForPayment("pay_TEST1");
    assert.equal(db.orders[0]?.status, "refunded");
    assert.ok(db.entitlements[0]?.revoked_at);

    const after = await getActiveEntitlementByPaymentId("pay_TEST1");
    assert.equal(after, null);

    // Revocation is idempotent.
    const revokedAt = db.entitlements[0]?.revoked_at;
    await revokeEntitlementForPayment("pay_TEST1");
    assert.equal(db.entitlements[0]?.revoked_at, revokedAt);
    assert.equal(db.orders[0]?.status, "refunded");
  });
});

describe("download link audit", () => {
  const db = createFakeDb();

  beforeEach(() => {
    db.orders.length = 0;
    db.entitlements.length = 0;
    db.download_events.length = 0;
    __setAdminClientForTests(createFakeSupabase(db) as never);
  });

  afterEach(() => {
    __setAdminClientForTests(null);
  });

  it("counts issued link events per entitlement", async () => {
    const result = await markPaymentCaptured(capturedInput);
    assert.ok(result.ok);
    const entitlementId = result.ok ? result.entitlementId : "";

    assert.equal(await countRecentLinkIssues(entitlementId), 0);
    await recordLinkIssued(entitlementId);
    await recordLinkIssued(entitlementId);
    assert.equal(await countRecentLinkIssues(entitlementId), 2);
  });
});
