export const SITE = {
  name: "Marketloom",
  owner: "Caelmont",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://market-loom-mu.vercel.app",
  tagline:
    "Structured Shopify store research for freelancers and agencies.",
  description:
    "A one-time digital research pack that helps Shopify freelancers, developers, and small agencies discover stores, organise prospect research, and identify potential website-improvement opportunities.",
  // LAUNCH BLOCKER: placeholder address. Replace with a real support inbox
  // before launch — tracked in LAUNCH_BLOCKERS below and in the README.
  contactEmail: "hello@marketloom.example.com",
  nav: [
    { label: "Product", href: "/#included" },
    { label: "Sample", href: "/sample" },
    { label: "FAQ", href: "/#faq" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Refunds", href: "/refunds" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

/**
 * Things that must be true before the pack is sold. Nothing here is invented
 * away: each item stays listed until it is actually resolved.
 */
export const LAUNCH_BLOCKERS = [
  {
    id: "support-email",
    summary: "SITE.contactEmail is the placeholder hello@marketloom.example.com — replace it with a real support inbox.",
  },
  {
    id: "dataset-validated",
    summary: "PRODUCT.contents.recordCount / markets / freshness stay null until the real dataset has been produced, validated, and exported by scripts/dataset/run.mts.",
  },
  {
    id: "payment-e2e",
    summary: "A full Razorpay test-mode purchase (webhook + verify + download of the real files) has not been completed end to end.",
  },
  {
    id: "legal-review",
    summary: "Privacy, terms, and refund pages are marked as awaiting legal review.",
  },
] as const;

export const CHECKOUT = {
  provider: "razorpay",
  note: "Payments are not live on this deployment yet. The purchase flow is wired to Razorpay and activates as soon as the server-side keys are configured.",
} as const;

export const PRODUCT = {
  id: "marketloom-research-pack",
  name: "Shopify Store Research Pack",
  shortName: "Research Pack",
  priceInr: 199,
  priceLabel: "₹199",
  paymentType: "One-time payment",
  delivery: "Digital download (CSV + XLSX)",
  /**
   * Published dataset version. Null until the first real dataset ships; the
   * delivery pipeline then pins entitlements to a `product_versions` row
   * (e.g. "v1") so later revisions never change what a customer bought.
   */
  version: null as string | null,
  /** Versioned storage layout inside the private bucket (server-side). */
  storage: {
    prefix: "marketloom/v1",
    fileBase: "marketloom-shopify-research-v1",
  },
  licensing: {
    summary:
      "Single-user business licence: use the rows for your own prospecting and outreach. Reselling or redistributing the files is not permitted.",
    termsPath: "/terms",
    reviewedByLegal: false,
  },
  audience:
    "Freelance Shopify developers, independent web designers, and small e-commerce agencies.",
  valueProposition:
    "Discover relevant Shopify stores, organise your prospect research, and identify potential website-improvement opportunities — without starting from a blank spreadsheet.",
  contents: {
    formats: ["CSV", "XLSX"] as const,
    recordCount: null as string | null,
    markets: null as string | null,
    freshness: null as string | null,
    /**
     * Customer-facing columns. `key` is the canonical field name produced by
     * the dataset pipeline (`src/lib/dataset/schema.ts`); `status` stays
     * "planned" until the real dataset contains the column for real.
     */
    fields: [
      { key: "store_name", name: "Store name", status: "planned" as const },
      { key: "store_url", name: "Store URL", status: "planned" as const },
      {
        key: "country_or_market",
        name: "Country / market",
        status: "planned" as const,
      },
      {
        key: "store_category",
        name: "Store category",
        status: "planned" as const,
      },
      {
        key: "public_contact_page_url",
        name: "Public business contact page",
        status: "planned" as const,
      },
      {
        key: "research_date",
        name: "Research date",
        status: "planned" as const,
      },
      {
        key: "opportunity_notes",
        name: "Observable opportunity notes",
        status: "planned" as const,
      },
      {
        key: "research_status",
        name: "Research status",
        status: "planned" as const,
      },
    ],
    emailVerification: false,
  },
} as const;

export const CTA = {
  primary: {
    label: `Get the Research Pack — ${PRODUCT.priceLabel}`,
    shortLabel: "Get the Pack — ₹199",
  },
  secondary: {
    label: "Explore the Free Sample",
    shortLabel: "Free Sample",
  },
} as const;

/**
 * Object-storage paths for the paid product, inside the private
 * `product-downloads` Supabase Storage bucket. Server-side only — these are
 * never accepted from user input and never exposed as permanent URLs.
 *
 * Paths are versioned (`marketloom/v1/…`) so a future dataset revision is
 * uploaded side-by-side instead of mutating the file a customer already paid
 * for. See docs/storage.md.
 */
export const PRODUCT_FILES = [
  {
    name: "Marketloom Research Pack (CSV)",
    path: "marketloom/v1/marketloom-shopify-research-v1.csv",
  },
  {
    name: "Marketloom Research Pack (XLSX)",
    path: "marketloom/v1/marketloom-shopify-research-v1.xlsx",
  },
] as const;
