/**
 * Shared payment/fulfillment types.
 *
 * Kept free of `server-only` and framework imports so the pure webhook /
 * download / verify cores (and their tests) can depend on the exact shapes the
 * real fulfillment module implements.
 */

export type CapturedPaymentInput = {
  providerOrderId: string;
  providerPaymentId: string;
  amountPaise: number;
  currency: string;
  productId: string;
  paidAtIso: string;
};

export type MarkPaidResult =
  | {
      ok: true;
      orderId: string;
      entitlementId: string;
      /** True only the first time this payment is fulfilled. */
      firstFulfillment: boolean;
    }
  | {
      ok: false;
      reason: "amount_mismatch" | "currency_mismatch" | "database_error";
      detail?: string;
    };

export type ActiveEntitlement = {
  entitlementId: string;
  orderId: string;
  productId: string;
  paymentId: string;
  /** Set when the entitlement is pinned to a product_versions row. */
  productVersionId: string | null;
};

export type ProductVersionRecord = {
  id: string;
  productId: string;
  version: string;
  csvPath: string;
  xlsxPath: string;
  recordCount: number | null;
};
