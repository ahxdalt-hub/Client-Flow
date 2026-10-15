import type { Metadata } from "next";
import Link from "next/link";

import { FaqAccordion, type FaqItem } from "@/components/faq-accordion";
import { Hero } from "@/components/hero";
import { PurchaseButton } from "@/components/purchase-button";
import { Reveal } from "@/components/reveal";
import { SpreadsheetPreview } from "@/components/spreadsheet-preview";
import { FaqStructuredData } from "@/components/structured-data";
import { TrackedLink } from "@/components/tracked-link";
import { PRODUCT, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `${SITE.name} — Find your next Shopify client without a blank spreadsheet`,
  description:
    "A structured Shopify store research pack for freelance Shopify developers, independent designers, and small agencies. Discover stores, organise prospects, and spot website-improvement opportunities. One-time ₹199.",
  alternates: { canonical: "/" },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What exactly do I receive?",
    answer:
      "A one-time digital download containing the research files in spreadsheet formats (CSV and XLSX). The exact record count, geographic scope, and field list are being finalised before launch — every confirmed specification is published on this page and on the sample page. Nothing is advertised here that is not actually included in the product.",
  },
  {
    question: "Who is this for?",
    answer:
      "Freelance Shopify developers, independent web designers, and small e-commerce development agencies who do their own prospecting and want a structured starting point instead of building a research sheet from scratch.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. Marketloom is a one-time purchase of a digital file. There is no recurring billing, no account, and no membership.",
  },
  {
    question: "How is the research collected?",
    answer:
      "From publicly available information on store websites and public business pages — for example a store's public contact or about page, visible navigation, and storefront layout. No private data, no login-protected information, and no guessing at personal contact details.",
  },
  {
    question: "How current is the data?",
    answer:
      "Each row is planned to include a research date so you can judge freshness yourself. The research reflects stores and pages as they appeared on those dates; e-commerce sites change often, so always re-check a store before reaching out. The finalised pack's freshness policy will be confirmed before launch.",
  },
  {
    question: "Are email addresses guaranteed to be verified?",
    answer:
      "No. Email verification is not included in the product. Where a public business contact page is listed, you should use that page to find the current way to contact the store. Nothing in this pack should be treated as a verified contact list.",
  },
  {
    question: "How do downloads work?",
    answer:
      "After a successful payment you receive access to download the files. Automated delivery is being connected to the payment provider right now — until checkout is live and tested, purchases are not being processed through this site.",
  },
  {
    question: "What are the usage and redistribution restrictions?",
    answer:
      "The pack is licensed for your own business use — your prospecting, research, and outreach. You may not resell, redistribute, publish, or share the files, in full or in part, including as part of another product or lead list. Full terms are on the Terms page.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "Because this is an instant digital download, the refund policy is narrower than for physical goods. The current policy — including what qualifies and how to request a refund — is described in full on the Refunds page. Contact support if your purchase did not deliver correctly.",
  },
];

const PROBLEMS = [
  {
    problem: "Discovering relevant stores",
    body: "Finding stores that plausibly need work means opening dozens of tabs and guessing from search results.",
    fix: "Start from a pre-organised sheet you can filter by market and category.",
  },
  {
    problem: "Organising the research",
    body: "Notes scatter across tabs, docs, and half-finished spreadsheets. Nothing stays usable past week one.",
    fix: "One structured file: consistent columns, research dates, and a status you control.",
  },
  {
    problem: "Finding improvement angles",
    body: "Without a first-pass review of each storefront, outreach stays generic — and generic gets ignored.",
    fix: "Observable opportunity notes give every shortlisted store a specific starting point for review.",
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Preview the sample",
    body: "Open the free sample to see the exact columns, note style, and organisation of the pack.",
  },
  {
    number: "02",
    title: "Purchase the pack",
    body: "A single one-time payment of ₹199. No account, no subscription, no recurring charge.",
  },
  {
    number: "03",
    title: "Download the files",
    body: "Receive the research files in openable spreadsheet formats you can sort and filter.",
  },
  {
    number: "04",
    title: "Work your shortlist",
    body: "Filter by market or category, review the opportunity notes, and prioritise stores worth a closer look.",
  },
] as const;

const USE_CASES = [
  {
    role: "Freelance Shopify developers",
    body: "Start outreach from a filtered shortlist instead of a blank tab. Open a store, review it against the notes, and decide in minutes whether it is worth a personal audit message.",
  },
  {
    role: "Independent web designers",
    body: "Use category and market columns to focus on the niches you actually build for, then reference a specific, observable detail in your first message.",
  },
  {
    role: "Small agencies",
    body: "Give new team members a structured research base so prospecting conversations start from shared notes instead of everyone building their own sheet.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <FaqStructuredData items={FAQ_ITEMS} />
      <Hero />

      {/* ── Problem · solution · how it works ─────────────────── */}
      <section id="how" className="border-b border-line bg-paper-raised/50">
        <div className="container-page py-16 md:py-24">
          <Reveal>
            <p className="eyebrow">The workflow this replaces</p>
            <h2 className="display-title mt-3 max-w-2xl text-[clamp(1.75rem,3.4vw,2.5rem)]">
              Prospecting eats hours before a single message is sent.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-x-10 gap-y-9 md:grid-cols-3">
            {PROBLEMS.map((card, index) => (
              <Reveal
                key={card.problem}
                delay={index * 90}
                className="border-t border-line pt-6"
              >
                <h3 className="text-base font-semibold tracking-tight">
                  {card.problem}
                </h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">
                  {card.body}
                </p>
                <div className="mt-5">
                  <p className="eyebrow !text-accent">How the pack helps</p>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                    {card.fix}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mt-10 max-w-3xl text-pretty text-sm leading-relaxed text-muted">
              This pack organises research. It does not promise clients,
              revenue, or replies — outcomes depend on your outreach, your
              offer, and each store&apos;s own situation.
            </p>
          </Reveal>

          <div className="mt-16">
            <Reveal>
              <h3 className="display-title text-[clamp(1.4rem,2.6vw,1.9rem)]">
                How it works
              </h3>
            </Reveal>
            <ol className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <Reveal
                  key={step.number}
                  as="li"
                  delay={index * 80}
                  className="border-t border-line pt-5"
                >
                  <span className="font-mono text-xs font-semibold tracking-widest text-accent">
                    {step.number}
                  </span>
                  <h4 className="mt-3 text-[15px] font-semibold tracking-tight">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Preview · included · use cases ───────────────────── */}
      <section id="preview" className="border-b border-line">
        <div className="container-page py-16 md:py-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <p className="eyebrow">Product preview</p>
              <h2 className="display-title mt-3 max-w-xl text-[clamp(1.75rem,3.4vw,2.5rem)]">
                Eight columns. Every row reviewable.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <TrackedLink
                href="/sample"
                event="sample_open"
                source="preview_section"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
              >
                See the full sample breakdown
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </TrackedLink>
            </Reveal>
          </div>

          <Reveal delay={140} className="mt-10">
            <SpreadsheetPreview selectedCell={{ row: 1, column: "opportunity" }} />
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div id="included">
              <Reveal>
                <p className="eyebrow">What&apos;s included</p>
                <h3 className="display-title mt-3 text-[clamp(1.4rem,2.6vw,1.9rem)]">
                  Exact contents, published before launch
                </h3>
                <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted">
                  The dataset is still being finalised. Anything not yet
                  confirmed is marked below rather than dressed up as a
                  finished specification.
                </p>
              </Reveal>

              <dl className="mt-8 divide-y divide-line border-y border-line">
                {[
                  {
                    term: "File formats",
                    value: PRODUCT.contents.formats.join(" · "),
                  },
                  {
                    term: "Record count",
                    value: PRODUCT.contents.recordCount ?? "To be confirmed",
                    pending: PRODUCT.contents.recordCount === null,
                  },
                  {
                    term: "Geographic scope",
                    value: PRODUCT.contents.markets ?? "To be confirmed",
                    pending: PRODUCT.contents.markets === null,
                  },
                  {
                    term: "Freshness policy",
                    value: PRODUCT.contents.freshness ?? "To be confirmed",
                    pending: PRODUCT.contents.freshness === null,
                  },
                  {
                    term: "Email verification",
                    value: "Not included",
                    pending: true,
                  },
                  {
                    term: "Usage licence",
                    value: "Single business, no redistribution",
                  },
                ].map((row) => (
                  <div
                    key={row.term}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                  >
                    <dt className="text-sm font-medium text-ink-soft">
                      {row.term}
                    </dt>
                    <dd
                      className={
                        row.pending
                          ? "rounded-full border border-dashed border-warning-line bg-warning-soft px-2.5 py-1 text-right text-xs font-semibold text-warning-ink"
                          : "text-right text-sm font-semibold text-ink"
                      }
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Reveal delay={80}>
                <p className="eyebrow mt-8">Planned fields</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {PRODUCT.contents.fields.map((field) => (
                    <li
                      key={field.name}
                      className="rounded-lg border border-line bg-paper-raised px-3 py-1.5 text-[13px] font-medium text-ink-soft"
                    >
                      {field.name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div id="use-cases">
              <Reveal>
                <p className="eyebrow">Use cases</p>
                <h3 className="display-title mt-3 text-[clamp(1.4rem,2.6vw,1.9rem)]">
                  Built for people who sell the work themselves
                </h3>
              </Reveal>
              <div className="mt-8">
                {USE_CASES.map((item, index) => (
                  <Reveal
                    key={item.role}
                    delay={index * 90}
                    className="border-t border-line py-5 first:border-t-0 first:pt-0"
                  >
                    <h4 className="text-[15px] font-semibold tracking-tight">
                      {item.role}
                    </h4>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing · FAQ · final CTA ─────────────────────────── */}
      <section id="pricing" className="bg-paper-raised/50">
        <div className="container-page py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-24 lg:self-start">
              <div className="card-soft rounded-2xl p-7 md:p-8">
                <p className="eyebrow">One offer</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="display-title text-5xl">
                    {PRODUCT.priceLabel}
                  </span>
                  <span className="text-sm font-medium text-muted">
                    one-time
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {PRODUCT.name} · {PRODUCT.delivery}
                </p>

                <ul className="mt-7 space-y-3 border-t border-line pt-7 text-sm">
                  {[
                    "Research files in openable spreadsheet formats",
                    "Structured columns incl. market, category & notes",
                    "Usage licence for your own prospecting work",
                    "Digital delivery after payment confirmation",
                    "Refund policy described on a dedicated page",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                      >
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M1.5 5.5 4 8l4.5-6"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="text-pretty text-ink-soft">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <PurchaseButton size="lg" block />
                </div>

                <p className="mt-4 text-center text-xs leading-relaxed text-muted">
                  Checkout opens once payment processing is connected and
                  tested.{" "}
                  <Link
                    href="/refunds"
                    className="underline decoration-line-strong underline-offset-4 hover:text-ink"
                  >
                    Refund policy
                  </Link>
                  {" · "}
                  <Link
                    href="/terms"
                    className="underline decoration-line-strong underline-offset-4 hover:text-ink"
                  >
                    Terms
                  </Link>
                </p>
              </div>
            </Reveal>

            <div id="faq">
              <Reveal>
                <p className="eyebrow">FAQ</p>
                <h2 className="display-title mt-3 text-[clamp(1.75rem,3.2vw,2.3rem)]">
                  Straight answers before you buy
                </h2>
              </Reveal>
              <Reveal delay={80} className="mt-8 max-w-3xl">
                <FaqAccordion
                  idBase="faq"
                  items={FAQ_ITEMS}
                  firstOpenByDefault
                />
              </Reveal>
            </div>
          </div>

          <Reveal className="mt-16 md:mt-20">
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-paper sm:px-12 md:px-16 md:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-72"
                style={{
                  background:
                    "radial-gradient(55% 100% at 50% 0%, rgb(43 65 232 / 0.32), transparent 75%)",
                }}
              />
              <div className="relative">
                <h2 className="display-title mx-auto max-w-2xl text-[clamp(1.75rem,3.6vw,2.7rem)]">
                  Stop rebuilding the same research sheet.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-paper/70">
                  Start with a structured pack, filter to your market, and spend
                  your time reviewing stores — not collecting them.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <div className="[&_button]:w-full [&_button]:bg-paper [&_button]:text-ink [&_.shimmer-btn:hover]:bg-white sm:[&_button]:w-auto">
                    <PurchaseButton
                      size="lg"
                      label={`Get the Research Pack — ${PRODUCT.priceLabel}`}
                    />
                  </div>
                  <Link
                    href="/sample"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-paper/25 px-7 py-4 text-[15px] font-semibold text-paper transition-colors duration-300 hover:border-paper/60 hover:bg-paper/5"
                  >
                    Explore the Free Sample
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
