/**
 * Razorpay id shapes — pure and dependency-free so `node --test` can cover
 * them. Used to validate client-supplied ids *before* any DB lookup or fetch.
 *
 * Razorpay order ids look like `order_ToeXK0uSLGxLg0`; payment ids look like
 * `pay_MrFvQ2sT2Zv9Xa`. We accept the documented prefix plus a base62 tail of
 * at least four characters — deliberately loose (Razorpay owns the exact
 * alphabet) but strict enough to reject obvious junk before it reaches a query.
 */

export const RAZORPAY_ORDER_ID_RE = /^order_[a-zA-Z0-9]{4,}$/;
export const RAZORPAY_PAYMENT_ID_RE = /^pay_[a-zA-Z0-9]{4,}$/;

export function isRazorpayOrderId(value: string): boolean {
  return RAZORPAY_ORDER_ID_RE.test(value);
}

export function isRazorpayPaymentId(value: string): boolean {
  return RAZORPAY_PAYMENT_ID_RE.test(value);
}

export type RazorpayReferenceKind = "order" | "payment";

export type RazorpayReference = { kind: RazorpayReferenceKind; value: string };

/** Classify a buyer-supplied reference, or null when it is neither shape. */
export function parseRazorpayReference(input: string): RazorpayReference | null {
  const value = input.trim();
  if (isRazorpayOrderId(value)) return { kind: "order", value };
  if (isRazorpayPaymentId(value)) return { kind: "payment", value };
  return null;
}
