import "server-only";

export type PaymentsEnv = {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  downloadTokenSecret: string;
};

const MIN_DOWNLOAD_TOKEN_SECRET_LENGTH = 32;

/**
 * Reads and validates every server-side payment/delivery secret. Returns the
 * list of missing variable names instead of throwing so routes can answer
 * 503 honestly while checkout is unconfigured. Never expose the `missing`
 * list contents beyond variable *names*.
 */
export function getPaymentsEnv():
  | { ok: true; env: PaymentsEnv }
  | { ok: false; missing: string[] } {
  const value = (name: string): string => (process.env[name] ?? "").trim();

  const razorpayKeyId = value("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  const razorpayKeySecret = value("RAZORPAY_KEY_SECRET");
  const razorpayWebhookSecret = value("RAZORPAY_WEBHOOK_SECRET");
  const supabaseUrl = value("SUPABASE_URL");
  const supabaseServiceRoleKey = value("SUPABASE_SERVICE_ROLE_KEY");
  const downloadTokenSecret = value("DOWNLOAD_TOKEN_SECRET");

  const missing: string[] = [];
  if (!razorpayKeyId) missing.push("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  if (!razorpayKeySecret) missing.push("RAZORPAY_KEY_SECRET");
  if (!razorpayWebhookSecret) missing.push("RAZORPAY_WEBHOOK_SECRET");
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!downloadTokenSecret) missing.push("DOWNLOAD_TOKEN_SECRET");
  if (downloadTokenSecret && downloadTokenSecret.length < MIN_DOWNLOAD_TOKEN_SECRET_LENGTH) {
    missing.push("DOWNLOAD_TOKEN_SECRET (must be at least 32 characters)");
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    env: {
      razorpayKeyId,
      razorpayKeySecret,
      razorpayWebhookSecret,
      supabaseUrl,
      supabaseServiceRoleKey,
      downloadTokenSecret,
    },
  };
}

export function isPaymentsConfigured(): boolean {
  return getPaymentsEnv().ok;
}
