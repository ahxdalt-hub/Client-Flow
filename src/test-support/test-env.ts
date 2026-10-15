/**
 * Test helpers for the server-side payment/delivery tests.
 *
 * The real env vars are never read: each test sets dummy values explicitly,
 * and `__setAdminClientForTests` swaps in the in-memory database.
 */

export const TEST_ENV_KEYS = [
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DOWNLOAD_TOKEN_SECRET",
] as const;

export const TEST_DOWNLOAD_TOKEN_SECRET =
  "test-download-token-secret-at-least-32-chars";
export const TEST_WEBHOOK_SECRET = "test-razorpay-webhook-secret";
export const TEST_KEY_ID = "rzp_test_dummykeyid";
export const TEST_KEY_SECRET = "test_key_secret_dummy";

export function setTestEnv(overrides: Record<string, string> = {}): void {
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = TEST_KEY_ID;
  process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_dummy";
  process.env.DOWNLOAD_TOKEN_SECRET = TEST_DOWNLOAD_TOKEN_SECRET;
  for (const [key, value] of Object.entries(overrides)) {
    process.env[key] = value;
  }
}

export function clearTestEnv(): void {
  for (const key of TEST_ENV_KEYS) {
    delete process.env[key];
  }
}
