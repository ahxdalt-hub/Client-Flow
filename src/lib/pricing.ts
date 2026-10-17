/**
 * Product + pricing constants — the single source of truth for the shop.
 * Server payment code always derives the charged amount from here (the
 * browser never sends a price or a product id that the server trusts).
 * Safe to import from client components (no server-only).
 */

export const PRODUCT = {
  name: "ClientFlow Outreach Kit",
  slug: "clientflow-outreach-kit",
  tagline:
    "The cold email, DM and follow-up system for Indian freelancers and small agencies.",
  regularPrice: 499,
  introPrice: 299,
} as const;

export const PRICING = {
  /** Introductory offer is active. Flip to false after the launch window. */
  introActive: true,
  intro: PRODUCT.introPrice,
  regular: PRODUCT.regularPrice,
  currency: "INR",
  // One-time purchase; no subscription, no recurring charges anywhere.
  paymentType: "one-time",
} as const;

/** Price currently charged. */
export const activePrice = () =>
  PRICING.introActive ? PRICING.intro : PRICING.regular;

export const amountInPaise = (rupees: number) => rupees * 100;

export const CONTACT = {
  email: "support@clientflow.store",
  business: "ClientFlow",
} as const;

export const REFUND_WINDOW_DAYS = 10;
/** Relative URL of the published refund policy (linked in checkout). */
export const REFUND_POLICY_PATH = "/refund-policy";

/**
 * Downloadable assets. The paid bundle ships these exact files; it lives in
 * `assets/deliverables/` (outside /public) and is served only through the
 * signed order route. Paths here describe contents, never URLs to fetch.
 */
export const DELIVERY = {
  paidBundleFile: "clientflow-outreach-kit.zip",
  paidBundleDir: "assets/deliverables",
  paidBundleContents: [
    "ClientFlow-Handbook.pdf",
    "Email-Templates.docx",
    "Proposal-Templates.docx",
    "Lead-Tracker.xlsx",
    "Quick-Start-Guide.pdf",
    "README.md",
  ],
  /** Free sample is ungated by design; everything paid is gated. */
  freeSampleUrl: "/downloads/clientflow-sample.zip",
} as const;
