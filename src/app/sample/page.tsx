import type { Metadata } from "next";
import Link from "next/link";

import { PurchaseButton } from "@/components/purchase-button";
import { Reveal } from "@/components/reveal";
import { SpreadsheetPreview } from "@/components/spreadsheet-preview";
import { CTA, PRODUCT } from "@/config/site";

export const metadata: Metadata = {
  title: "Free sample preview",
  description:
    "See the structure of the Shopify Store Research Pack: columns, note style, and organisation — before anything is purchased.",
  alternates: { canonical: "/sample" },
};

const SAMPLE_ROWS = [
  {
    store: "Example Home Goods",
    url: "example-home-goods.example",
    market: "IN",
    category: "Home & garden",
    contact: "/pages/contact",
    researched: "12 Sep 2026",
    opportunity: "Mobile menu missing collections links",
    status: "to-review" as const,
  },
  {
    store: "Sample Skincare Co.",
    url: "sample-skincare.example",
    market: "US",
    category: "Beauty",
    contact: "/pages/help",
    researched: "12 Sep 2026",
    opportunity: "No size / routine guide on PDP",
    status: "reviewed" as const,
  },
  {
    store: "Demo Fitness Store",
    url: "demo-fitness.example",
    market: "UK",
    category: "Fitness",
    contact: "/contact",
    researched: "13 Sep 2026",
    opportunity: "Blog present but unlinked from nav",
    status: "queued" as const,
  },
  {
    store: "Placeholder Pet Supply",
    url: "placeholder-pets.example",
    market: "CA",
    category: "Pets",
    contact: "/pages/contact-us",
    researched: "13 Sep 2026",
    opportunity: "Collection page lacks filtering",
    status: "to-review" as const,
  },
  {
    store: "Illustrative Coffee Brand",
    url: "illustrative-coffee.example",
    market: "AU",
    category: "Food & drink",
    contact: "/pages/about",
    researched: "14 Sep 2026",
    opportunity: "No email signup on thank-you page",
    status: "reviewed" as const,
  },
  {
    store: "Fictional Stationery Shop",
    url: "fictional-stationery.example",
    market: "DE",
    category: "Stationery",
    contact: "/pages/kontakt",
    researched: "14 Sep 2026",
    opportunity: "Product images below common size guidelines",
    status: "queued" as const,
  },
  {
    store: "Made-up Outdoor Gear",
    url: "madeup-outdoor.example",
    market: "US",
    category: "Outdoor",
    contact: "/pages/contact",
    researched: "15 Sep 2026",
    opportunity: "No shipping FAQ linked near add-to-cart",
    status: "to-review" as const,
  },
] as const;

const FIELD_NOTES = [
  {
    column: "Store name",
    note: "The store's public-facing brand name so you can reference it in outreach.",
  },
  {
    column: "Store URL",
    note: "The storefront address you open to run your own review before contacting anyone.",
  },
  {
    column: "Country / market",
    note: "The primary market where known, so you can filter to regions you sell into.",
  },
  {
    column: "Store category",
    note: "A broad niche label for focusing on the verticals you build for.",
  },
  {
    column: "Public business contact page",
    note: "The store's own public contact or help page — the correct route to reach them.",
  },
  {
    column: "Research date",
    note: "When the row was reviewed, so you can judge how fresh the notes are.",
  },
  {
    column: "Observable opportunity notes",
    note: "A short, factual observation from the public storefront — a starting point for your own review, not a diagnosis.",
  },
  {
    column: "Research status",
    note: "A status label you can filter and re-use as you work the list.",
  },
];

export default function SamplePage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="container-page py-14 md:py-20">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-muted">
                <li>
                  <Link href="/" className="transition-colors hover:text-ink">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="font-medium text-ink">Sample</li>
              </ol>
            </nav>
            <p className="eyebrow">Free sample</p>
            <h1 className="display-title mt-3 max-w-2xl text-[clamp(2rem,4.6vw,3.2rem)]">
              See exactly how the pack is organised.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
              The sample shows the columns, note style, and overall structure of
              the research file. Every row below is fictional — it exists to
              demonstrate the format, not to represent real stores or real
              research.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-10">
            <SpreadsheetPreview rows={[...SAMPLE_ROWS]} />
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="rounded-full border border-dashed border-warning-line bg-warning-soft px-3 py-1.5 text-xs font-semibold text-warning-ink">
                Illustrative example data — not verified research
              </p>
              <Link
                href="/#preview"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Back to the homepage preview
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-paper-raised/50">
        <div className="container-page py-16 md:py-24">
          <Reveal>
            <p className="eyebrow">What each column is for</p>
            <h2 className="display-title mt-3 max-w-2xl text-[clamp(1.65rem,3.2vw,2.3rem)]">
              Eight columns, each with a job
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-x-10 gap-y-0 md:grid-cols-2">
            {FIELD_NOTES.map((field, index) => (
              <Reveal
                key={field.column}
                delay={(index % 2) * 70}
                className="border-b border-line py-5"
              >
                <h3 className="font-mono text-[13px] font-semibold tracking-tight text-accent-ink">
                  {field.column}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
                  {field.note}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container-page py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="eyebrow">Sample vs full pack</p>
              <h2 className="display-title mt-3 text-[clamp(1.65rem,3.2vw,2.1rem)]">
                What the sample is — and isn&apos;t
              </h2>
              <div className="mt-6 space-y-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
                <p>
                  The sample is a format demonstration. It shows how rows are
                  structured, how opportunity notes are phrased, and what the
                  research status column is for.
                </p>
                <p>
                  The purchased pack is the actual research dataset. Its record
                  count, geographic scope, and freshness policy are still being
                  finalised and will be published on the homepage before launch
                  — nothing here claims specifications that are not yet real.
                </p>
                <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-muted">
                  As with the preview, no sample row describes a real business.
                  The pack itself will contain research on real public
                  storefronts, each with a research date.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PurchaseButton label={CTA.primary.label} />
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card-soft rounded-2xl p-7 md:p-8">
                <p className="eyebrow">Purchase summary</p>
                <dl className="mt-5 divide-y divide-line">
                  {[
                    { term: "Product", value: PRODUCT.name },
                    {
                      term: "Price",
                      value: `${PRODUCT.priceLabel} · one-time`,
                    },
                    { term: "Delivery", value: PRODUCT.delivery },
                    { term: "Records", value: "To be confirmed" },
                    { term: "Email verification", value: "Not included" },
                  ].map((row) => (
                    <div
                      key={row.term}
                      className="flex items-baseline justify-between gap-6 py-3.5"
                    >
                      <dt className="text-sm text-muted">{row.term}</dt>
                      <dd className="text-right text-sm font-semibold text-ink">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 text-xs leading-relaxed text-muted">
                  Checkout is not live until payment processing is connected
                  and tested. Until then, use this page and the homepage to
                  evaluate the product, and{" "}
                  <Link
                    href="/contact"
                    className="underline decoration-line-strong underline-offset-4 hover:text-ink"
                  >
                    contact support
                  </Link>{" "}
                  with questions.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
