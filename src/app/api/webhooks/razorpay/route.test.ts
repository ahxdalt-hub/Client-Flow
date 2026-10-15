import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";

import { POST } from "./route.ts";
import { __setAdminClientForTests } from "@/lib/server/db.ts";
import {
  createFakeDb,
  createFakeSupabase,
  type FakeDb,
} from "@/test-support/fake-supabase.ts";
import {
  TEST_WEBHOOK_SECRET,
  clearTestEnv,
  setTestEnv,
} from "@/test-support/test-env.ts";

function sign(body: string, secret: string = TEST_WEBHOOK_SECRET): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

function capturedEventBody(
  overrides: Record<string, unknown> = {},
): string {
  return JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_TEST1",
          order_id: "order_TEST1",
          amount: 19900,
          currency: "INR",
          created_at: 1_760_000_000,
          ...overrides,
        },
      },
    },
  });
}

async function postWebhook(
  body: string,
  signature: string | null,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const request = new Request(
    "https://market-loom-mu.vercel.app/api/webhooks/razorpay",
    {
      method: "POST",
      headers: signature ? { "x-razorpay-signature": signature } : {},
      body,
    },
  );
  const response = await POST(request);
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
}

describe("POST /api/webhooks/razorpay", () => {
  let db: FakeDb;

  beforeEach(() => {
    setTestEnv();
    db = createFakeDb();
    __setAdminClientForTests(createFakeSupabase(db) as never);
  });

  afterEach(() => {
    __setAdminClientForTests(null);
    clearTestEnv();
  });

  it("fulfills a captured payment exactly once, even when delivered twice", async () => {
    const body = capturedEventBody();

    const first = await postWebhook(body, sign(body));
    assert.equal(first.status, 200);
    assert.equal(first.body.state, "fulfilled");
    assert.equal(first.body.firstFulfillment, true);

    const duplicate = await postWebhook(body, sign(body));
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.state, "fulfilled");
    assert.equal(duplicate.body.firstFulfillment, false);

    assert.equal(db.orders.length, 1);
    assert.equal(db.entitlements.length, 1);
    assert.equal(db.orders[0]?.status, "paid");
    assert.equal(db.orders[0]?.provider_payment_id, "pay_TEST1");
  });

  it("rejects an invalid signature before touching the database", async () => {
    const body = capturedEventBody();
    const forged = sign(body, "some-other-webhook-secret");

    const response = await postWebhook(body, forged);
    assert.equal(response.status, 401);
    assert.equal(response.body.state, "invalid_signature");
    assert.equal(db.orders.length, 0);
    assert.equal(db.entitlements.length, 0);

    const missing = await postWebhook(body, null);
    assert.equal(missing.status, 401);

    const tampered = await postWebhook(`${body} `, sign(body));
    assert.equal(tampered.status, 401);
    assert.equal(db.orders.length, 0);
  });

  it("acknowledges a payment captured for the wrong amount without fulfilling", async () => {
    const body = capturedEventBody({ amount: 1 });
    const response = await postWebhook(body, sign(body));

    assert.equal(response.status, 200);
    assert.equal(response.body.state, "ignored");
    assert.equal(response.body.reason, "amount_mismatch");
    assert.equal(db.entitlements.length, 0);
  });

  it("records failed payments without granting anything", async () => {
    // Checkout always creates the order row before the customer can pay.
    db.orders.push({
      id: "order-row-failed",
      provider: "razorpay",
      provider_order_id: "order_FAILED1",
      provider_payment_id: null,
      product_id: "marketloom-research-pack",
      status: "created",
      amount_paise: 19900,
      currency: "INR",
    });

    const body = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_FAILED1",
            order_id: "order_FAILED1",
            amount: 19900,
            currency: "INR",
          },
        },
      },
    });

    const response = await postWebhook(body, sign(body));
    assert.equal(response.status, 200);
    assert.equal(response.body.state, "recorded_failed");
    assert.equal(db.orders.length, 1);
    assert.equal(db.orders[0]?.status, "failed");
    assert.equal(db.entitlements.length, 0);
  });

  it("never downgrades a paid order when a late failure event arrives", async () => {
    const captured = capturedEventBody();
    await postWebhook(captured, sign(captured));

    const failed = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_TEST1",
            order_id: "order_TEST1",
            amount: 19900,
            currency: "INR",
          },
        },
      },
    });
    const response = await postWebhook(failed, sign(failed));
    assert.equal(response.status, 200);
    assert.equal(response.body.state, "recorded_failed");
    assert.equal(db.orders[0]?.status, "paid");
    assert.equal(db.entitlements.length, 1);
    assert.equal(db.entitlements[0]?.revoked_at, null);
  });

  it("revokes entitlements when a refund is processed", async () => {
    const captured = capturedEventBody();
    await postWebhook(captured, sign(captured));
    assert.equal(db.entitlements.length, 1);

    const refund = JSON.stringify({
      event: "refund.processed",
      payload: { refund: { entity: { payment_id: "pay_TEST1" } } },
    });
    const response = await postWebhook(refund, sign(refund));
    assert.equal(response.status, 200);
    assert.equal(response.body.state, "revoked");
    assert.ok(db.entitlements[0]?.revoked_at);
    assert.equal(db.orders[0]?.status, "refunded");
  });

  it("ignores unknown events with a 200 so the provider stops retrying", async () => {
    const body = JSON.stringify({ event: "subscription.charged", payload: {} });
    const response = await postWebhook(body, sign(body));
    assert.equal(response.status, 200);
    assert.equal(response.body.state, "ignored");
  });

  it("rejects malformed JSON that carries a valid signature", async () => {
    const body = "{not-json";
    const response = await postWebhook(body, sign(body));
    assert.equal(response.status, 400);
    assert.equal(response.body.state, "invalid_payload");
  });

  it("returns 503 while payments are unconfigured", async () => {
    clearTestEnv();
    const body = capturedEventBody();
    const response = await postWebhook(body, sign(body));
    assert.equal(response.status, 503);
    assert.equal(db.orders.length, 0);
  });
});
