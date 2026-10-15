export type ConversionEvent =
  | "purchase_click"
  | "sample_open"
  | "faq_open"
  | "checkout_notice_open"
  | "checkout_started"
  | "checkout_opened"
  | "checkout_dismissed"
  | "checkout_failed"
  | "payment_pending"
  | "payment_failed"
  | "payment_verified"
  | "download_link_issued";

type EventPayload = Record<string, string | number | boolean>;

type Transport = (event: ConversionEvent, payload: EventPayload) => void;

const transports: Transport[] = [];

export function registerConversionTransport(transport: Transport): () => void {
  transports.push(transport);
  return () => {
    const index = transports.indexOf(transport);
    if (index >= 0) transports.splice(index, 1);
  };
}

export function trackConversion(
  event: ConversionEvent,
  payload: EventPayload = {},
): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[conversion]", event, payload);
  }

  if (typeof window !== "undefined") {
    const dataLayer = (
      window as unknown as {
        dataLayer?: Array<{ event: string } & EventPayload>;
      }
    ).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({ event, ...payload });
    }
  }

  for (const transport of transports) {
    try {
      transport(event, payload);
    } catch {
      // A broken analytics transport must never break the storefront.
    }
  }
}
