/**
 * Whether Razorpay is wired up with LIVE keys for this build.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so this is safe to read from
 * both server and client components. Marketing copy that promises an
 * operational checkout ("instant download", "UPI & cards") is only shown when
 * this is true — with test/missing keys a real payment cannot be taken, so the
 * claim would be false.
 */
const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

export const PAYMENTS_CONFIGURED = KEY_ID.length > 0;
export const PAYMENTS_LIVE = KEY_ID.startsWith("rzp_live_");
