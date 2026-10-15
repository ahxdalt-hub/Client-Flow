import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET } from "./route.ts";
import { PRODUCT_FILES } from "@/config/site";
import { __setAdminClientForTests } from "@/lib/server/db.ts";
import { markPaymentCaptured } from "@/lib/server/fulfillment";
import {
  DOWNLOAD_TOKEN_TTL_SECONDS,
  encodeDownloadToken,
} from "@/lib/server/payment-crypto";
import {
  createFakeDb,
  createFakeSupabase,
  type FakeDb,
  type FakeStorageFile,
} from "@/test-support/fake-supabase.ts";
import {
  TEST_DOWNLOAD_TOKEN_SECRET,
  clearTestEnv,
  setTestEnv,
} from "@/test-support/test-env.ts";

type DownloadBody = {
  state: string;
  message?: string;
  files?: { name: string; url: string; expiresAt: string }[];
  expiresAt?: string;
  retryAfterSeconds?: number;
};

function tokenFor(
  paymentId: string,
  options: { expSeconds?: number; secret?: string } = {},
): string {
  const now = Math.floor(Date.now() / 1000);
  return encodeDownloadToken(
    {
      v: 1,
      pay: paymentId,
      pid: "marketloom-research-pack",
      exp: now + (options.expSeconds ?? DOWNLOAD_TOKEN_TTL_SECONDS),
    },
    options.secret ?? TEST_DOWNLOAD_TOKEN_SECRET,
  );
}

async function getDownload(
  token: string | null,
): Promise<{ status: number; body: DownloadBody }> {
  const url = new URL("https://market-loom-mu.vercel.app/api/download");
  if (token !== null) url.searchParams.set("token", token);
  const response = await GET(new Request(url));
  return { status: response.status, body: (await response.json()) as DownloadBody };
}

const DEFAULT_STORAGE_FILES: FakeStorageFile[] = PRODUCT_FILES.map((file) => ({
  bucket: "product-downloads",
  path: file.path,
}));

async function seedPaidOrder(db: FakeDb, paymentId = "pay_TEST1"): Promise<void> {
  const result = await markPaymentCaptured({
    providerOrderId: `order_${paymentId}`,
    providerPaymentId: paymentId,
    amountPaise: 19900,
    currency: "INR",
    productId: "marketloom-research-pack",
    paidAtIso: "2026-10-15T10:00:00.000Z",
  });
  assert.equal(result.ok, true);
  assert.ok(db.orders.length === 1);
}

describe("GET /api/download", () => {
  let db: FakeDb;
  let storageFiles: FakeStorageFile[];

  function useStorage(files: FakeStorageFile[]): void {
    storageFiles.length = 0;
    storageFiles.push(...files);
    __setAdminClientForTests(createFakeSupabase(db, storageFiles) as never);
  }

  beforeEach(() => {
    setTestEnv();
    db = createFakeDb();
    storageFiles = [...DEFAULT_STORAGE_FILES];
    __setAdminClientForTests(createFakeSupabase(db, storageFiles) as never);
  });

  afterEach(() => {
    __setAdminClientForTests(null);
    clearTestEnv();
  });

  it("issues short-lived signed URLs for a verified, entitled payment", async () => {
    await seedPaidOrder(db);

    const { status, body } = await getDownload(tokenFor("pay_TEST1"));
    assert.equal(status, 200);
    assert.equal(body.state, "ready");
    assert.equal(body.files?.length, 2);
    for (const file of body.files ?? []) {
      assert.ok(file.url.includes("storage.example"));
      assert.ok(file.url.includes("product-downloads"));
      assert.ok(file.expiresAt);
    }

    // Minimal audit row (entitlement id + timestamp), one per issuance.
    assert.equal(db.download_events.length, 1);
    assert.equal(db.download_events[0]?.kind, "link_issued");
    assert.equal(db.download_events[0]?.entitlement_id, db.entitlements[0]?.id);
  });

  it("denies missing, forged, and expired tokens", async () => {
    await seedPaidOrder(db);

    const missing = await getDownload(null);
    assert.equal(missing.status, 400);
    assert.equal(missing.body.state, "missing_token");

    const forged = await getDownload(
      tokenFor("pay_TEST1", { secret: "another-secret-at-least-32-characters!" }),
    );
    assert.equal(forged.status, 401);
    assert.equal(forged.body.state, "invalid_token");

    const tampered = await getDownload(
      `${tokenFor("pay_TEST1")}.extra`,
    );
    assert.equal(tampered.status, 401);

    const expired = await getDownload(tokenFor("pay_TEST1", { expSeconds: -60 }));
    assert.equal(expired.status, 401);
    assert.equal(expired.body.state, "expired_token");

    assert.equal(db.download_events.length, 0);
  });

  it("denies a valid token whose payment has no entitlement (unpaid)", async () => {
    const { status, body } = await getDownload(tokenFor("pay_NEVER_PAID"));
    assert.equal(status, 403);
    assert.equal(body.state, "no_entitlement");
  });

  it("denies access immediately after a refund revokes the entitlement", async () => {
    await seedPaidOrder(db);
    db.entitlements[0]!.revoked_at = "2026-10-15T11:00:00.000Z";

    const { status, body } = await getDownload(tokenFor("pay_TEST1"));
    assert.equal(status, 403);
    assert.equal(body.state, "no_entitlement");
  });

  it("resolves the product version the entitlement is pinned to", async () => {
    db.product_versions.push({
      id: "version-v2",
      product_id: "marketloom-research-pack",
      version: "v2",
      csv_path: "marketloom/v2/marketloom-shopify-research-v2.csv",
      xlsx_path: "marketloom/v2/marketloom-shopify-research-v2.xlsx",
      record_count: 250,
      is_current: true,
    });
    await seedPaidOrder(db);
    useStorage([
      { bucket: "product-downloads", path: "marketloom/v2/marketloom-shopify-research-v2.csv" },
      { bucket: "product-downloads", path: "marketloom/v2/marketloom-shopify-research-v2.xlsx" },
    ]);

    const { status, body } = await getDownload(tokenFor("pay_TEST1"));
    assert.equal(status, 200);
    const urls = (body.files ?? []).map((file) => file.url).join(" ");
    assert.ok(urls.includes("marketloom/v2/marketloom-shopify-research-v2.csv"));
    assert.ok(urls.includes("marketloom/v2/marketloom-shopify-research-v2.xlsx"));
    assert.ok(!urls.includes("marketloom/v1/"));
  });

  it("returns 503 when the product files have not been uploaded", async () => {
    await seedPaidOrder(db);
    useStorage([]);

    const { status, body } = await getDownload(tokenFor("pay_TEST1"));
    assert.equal(status, 503);
    assert.equal(body.state, "file_missing");
    assert.equal(db.download_events.length, 0);
  });

  it("rate-limits link issuance per entitlement", async () => {
    await seedPaidOrder(db);

    for (let i = 0; i < 20; i += 1) {
      const { status } = await getDownload(tokenFor("pay_TEST1"));
      assert.equal(status, 200);
    }

    const limited = await getDownload(tokenFor("pay_TEST1"));
    assert.equal(limited.status, 429);
    assert.equal(limited.body.state, "rate_limited");
    assert.equal(limited.body.retryAfterSeconds, 3600);
    assert.equal(db.download_events.length, 20);
  });

  it("returns 503 while delivery is unconfigured", async () => {
    clearTestEnv();
    const { status, body } = await getDownload(tokenFor("pay_TEST1"));
    assert.equal(status, 503);
    assert.equal(body.state, "not_configured");
  });
});
