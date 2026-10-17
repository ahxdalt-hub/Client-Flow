/**
 * Whether this build can take **real money**.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so this is readable from both
 * server and client components. Marketing copy that promises an operational
 * checkout ("instant download", "UPI & cards") is only shown when this is true:
 * with the payment provider in test mode a real payment cannot be taken, so the
 * claim would be false.
 *
 * Set `NEXT_PUBLIC_PAYMENTS_LIVE=true` in the build environment when you switch
 * the payment provider to live keys.
 */
export const PAYMENTS_LIVE =
  (process.env.NEXT_PUBLIC_PAYMENTS_LIVE ?? "").toLowerCase() === "true";
