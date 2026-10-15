export const SITE = {
  name: "Marketloom",
  owner: "Caelmont",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://market-loom.vercel.app",
  tagline:
    "Structured Shopify store research for freelancers and agencies.",
  description:
    "A one-time digital research pack that helps Shopify freelancers, developers, and small agencies discover stores, organise prospect research, and identify potential website-improvement opportunities.",
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

export const CHECKOUT = {
  provider: "razorpay",
  note: "Secure checkout has not been connected yet. The storefront, purchase flow, and success page are ready for a payment provider.",
} as const;

export const PRODUCT = {
  id: "marketloom-research-pack",
  name: "Shopify Store Research Pack",
  shortName: "Research Pack",
  priceInr: 199,
  priceLabel: "₹199",
  paymentType: "One-time payment",
  delivery: "Digital download (CSV + XLSX)",
  audience:
    "Freelance Shopify developers, independent web designers, and small e-commerce agencies.",
  valueProposition:
    "Discover relevant Shopify stores, organise your prospect research, and identify potential website-improvement opportunities — without starting from a blank spreadsheet.",
  contents: {
    formats: ["CSV", "XLSX"] as const,
    recordCount: null as string | null,
    markets: null as string | null,
    freshness: null as string | null,
    fields: [
      { name: "Store name", status: "planned" as const },
      { name: "Store URL", status: "planned" as const },
      { name: "Country / market", status: "planned" as const },
      { name: "Store category", status: "planned" as const },
      { name: "Public business contact page", status: "planned" as const },
      { name: "Research date", status: "planned" as const },
      { name: "Observable opportunity notes", status: "planned" as const },
      { name: "Research status", status: "planned" as const },
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
 */
export const PRODUCT_FILES = [
  {
    name: "Marketloom Research Pack (CSV)",
    path: "research-pack/marketloom-research-pack.csv",
  },
  {
    name: "Marketloom Research Pack (XLSX)",
    path: "research-pack/marketloom-research-pack.xlsx",
  },
] as const;
