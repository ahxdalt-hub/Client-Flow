import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET } from "./route.ts";
import { __setAdminClientForTests } from "@/lib/server/db.ts";
import { decodeDownloadToken } from "@/lib/server/payment-crypto";
import {
  createFakeDb,
  createFakeSupabase,
  type FakeDb,
} from "@/test-support/fake-supabase.ts";
import {
  TEST_DOWNLOAD_TOKEN_SECRET,
  clearTestEnv,
  setTestEnv,
} from "@/test-support/test-env.ts";

type VerifyBody = {
  state: string;
  paymentId?: string;
  orderId?: string;
  downloadToken?: string;
  providerStatus?: string;
  reason?: string;
};

const capturedPayment = {
  id: "pay_TEST1",
  order_id: "order_TEST1",
  amount: 19900,
  currency: "INR",
  status: "captured",
  error_code: null,
  error_description: null,
  created_at: 1_760_000_000,
};

const realFetch = globalThis.fetch;

function mockRazorpayPayment(payment: Record<string, unknown> | null): void {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (!url.includes("/payments/")) {
      return new Response(JSON.stringify({ error: "unexpected" }), { status: 500 });
    }
    if (payment === null) {
      return new Response(JSON.stringify({ error: { description: "not found" } }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(payment), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

async function getVerify(
  paymentId: string | null,
): Promise<{ status: number; body: VerifyBody }> {
  const url = new URL("https://market-loom-mu.vercel.app/api/verify");
  if (paymentId !== null) url.searchParams.set("payment_id", paymentId);
  const response = await GET(new Request(url));
  return { status: response.status, body: (await response.json()) as VerifyBody };
}

describe("GET /api/verify", () => {
  let db: FakeDb;

  beforeEach(() => {
    setTestEnv();
    db = createFakeDb();
    __setAdminClientForTests(createFakeSupabase(db) as never);
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    __setAdminClientForTests(null);
    clearTestEnv();
  });

  it("fulfills a captured payment and issues a bound download token", async () => {
    mockRazorpayPayment(capturedPayment);

    const { status, body } = await getVerify("pay_TEST1");
    assert.equal(status, 200);
    assert.equal(body.state, "verified");
    assert.equal(body.paymentId, "pay_TEST1");
    assert.ok(body.orderId);
    assert.ok(body.downloadToken);

    const decoded = decodeDownloadToken(
      body.downloadToken!,
      TEST_DOWNLOAD_TOKEN_SECRET,
    );
    assert.equal(decoded.ok, true);
    if (decoded.ok) {
      assert.equal(decoded.payload.pay, "pay_TEST1");
      assert.equal(decoded.payload.pid, "marketloom-research-pack");
    }

    assert.equal(db.orders.length, 1);
    assert.equal(db.orders[0]?.status, "paid");
    assert.equal(db.entitlements.length, 1);
  });

  it("never trusts a client claim: non-captured payments are not fulfilled", async () => {
    for (const status of ["created", "authorized", "failed", "refunded"]) {
      mockRazorpayPayment({ ...capturedPayment, status });
      const response = await getVerify("pay_TEST1");
      assert.ok(response.status === 200 || response.status === 409);
      assert.notEqual(response.body.state, "verified");
    }
    assert.equal(db.orders.length, 0);
    assert.equal(db.entitlements.length, 0);
  });

  it("refuses to fulfill a captured payment with the wrong amount", async () => {
    mockRazorpayPayment({ ...capturedPayment, amount: 100 });

    const { status, body } = await getVerify("pay_TEST1");
    assert.equal(status, 409);
    assert.equal(body.state, "unfulfillable");
    assert.equal(body.reason, "amount_mismatch");
    assert.equal(db.entitlements.length, 0);
  });

  it("returns 404 for payments the provider does not know", async () => {
    mockRazorpayPayment(null);
    const { status, body } = await getVerify("pay_UNKNOWN");
    assert.equal(status, 404);
    assert.equal(body.state, "not_found");
  });

  it("returns 400 when no payment id is supplied", async () => {
    mockRazorpayPayment(capturedPayment);
    const { status, body } = await getVerify(null);
    assert.equal(status, 400);
    assert.equal(body.state, "missing_payment_id");
    assert.equal(db.orders.length, 0);
  });

  it("surfaces provider failures as 502 without fulfilling", async () => {
    globalThis.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;

    const { status, body } = await getVerify("pay_TEST1");
    assert.equal(status, 502);
    assert.equal(body.state, "provider_error");
    assert.equal(db.orders.length, 0);
  });

  it("returns 503 while payments are unconfigured", async () => {
    clearTestEnv();
    mockRazorpayPayment(capturedPayment);
    const { status, body } = await getVerify("pay_TEST1");
    assert.equal(status, 503);
    assert.equal(body.state, "not_configured");
  });
});
