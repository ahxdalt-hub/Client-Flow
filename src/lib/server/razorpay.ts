import "server-only";

const API_BASE = "https://api.razorpay.com/v1";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  error_code: string | null;
  error_description: string | null;
  created_at: number;
};

export class RazorpayApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RazorpayApiError";
    this.status = status;
  }
}

async function razorpayFetch<T>(
  keyId: string,
  keySecret: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const auth = Buffer.from(`${keyId}:${keySecret}`, "utf8").toString("base64");
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(10_000),
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 404) {
    throw new RazorpayApiError(`Razorpay resource not found: ${path}`, 404);
  }
  if (!response.ok) {
    throw new RazorpayApiError(
      `Razorpay API ${path} failed with ${response.status}`,
      response.status,
    );
  }
  return (await response.json()) as T;
}

export async function createRazorpayOrder(
  credentials: { keyId: string; keySecret: string },
  input: {
    amountPaise: number;
    currency: string;
    receipt: string;
    notes: Record<string, string>;
  },
): Promise<RazorpayOrder> {
  return razorpayFetch<RazorpayOrder>(
    credentials.keyId,
    credentials.keySecret,
    "/orders",
    {
      method: "POST",
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes,
      }),
    },
  );
}

/** Fetches a payment by id. Returns null when Razorpay reports 404. */
export async function fetchRazorpayPayment(
  credentials: { keyId: string; keySecret: string },
  paymentId: string,
): Promise<RazorpayPayment | null> {
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) return null;
  try {
    return await razorpayFetch<RazorpayPayment>(
      credentials.keyId,
      credentials.keySecret,
      `/payments/${encodeURIComponent(paymentId)}`,
    );
  } catch (error) {
    if (error instanceof RazorpayApiError && error.status === 404) {
      return null;
    }
    // Razorpay answers HTTP 400 ("The id provided does not exist") for
    // well-formed ids that are not real payments — treat as not found.
    if (
      error instanceof RazorpayApiError &&
      error.status === 400 &&
      error.message.includes("/payments/")
    ) {
      return null;
    }
    throw error;
  }
}
