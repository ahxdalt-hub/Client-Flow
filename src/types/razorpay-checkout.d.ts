/**
 * Minimal type surface for the Razorpay Checkout JS loaded from
 * checkout.razorpay.com — only what this app uses.
 */

declare global {
  interface RazorpaySuccess {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
    theme?: { color?: string };
    handler: (response: RazorpaySuccess) => void;
    modal?: {
      ondismiss?: () => void;
      confirm_close?: boolean;
    };
  }

  interface RazorpayInstance {
    open: () => void;
    on: (event: string, cb: (payload: unknown) => void) => void;
  }

  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export {};
