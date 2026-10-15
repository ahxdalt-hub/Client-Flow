import { CHECKOUT } from "@/config/site";

export type CheckoutIntent =
  | { status: "ready"; provider: "razorpay"; keyId: string }
  | { status: "not_configured"; note: string };

/**
 * Client-safe checkout gating. The Razorpay key *id* is publishable by
 * design; the key secret and every other payment secret stay server-side.
 * Checkout only reports "ready" when the publishable key is present at build
 * time — the server independently re-checks the full secret set on every
 * checkout/verify request.
 */
export function getCheckout(): CheckoutIntent {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (CHECKOUT.provider === "razorpay" && keyId) {
    return { status: "ready", provider: "razorpay", keyId };
  }
  return { status: "not_configured", note: CHECKOUT.note };
}
