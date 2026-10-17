import type { Metadata } from "next";
import Image from "next/image";

import { Hero } from "@/components/marketing/hero";
import { NicheBand } from "@/components/marketing/niche-band";
import { ProofBand } from "@/components/marketing/proof-band";
import { Inside } from "@/components/marketing/inside";
import { LookInside } from "@/components/marketing/look-inside";
import { PipelineSection } from "@/components/marketing/pipeline-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FaqBackdrop, FaqSection } from "@/components/marketing/faq";
import { SampleTeaser } from "@/components/marketing/sample-teaser";
import { CtaBand } from "@/components/marketing/cta-band";
import { Section, SectionHeading, Container } from "@/components/ui";
import { Reveal, Spotlight } from "@/components/motion";
import { SITE } from "@/config/site";
import { activePrice, PRICING, PRODUCT } from "@/lib/pricing";
import { FILE_COUNT, HANDBOOK_PAGES, INCLUDED_FILES } from "@/lib/product-content";
import { jsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Freelance Outreach Templates & Lead Tracker | ClientFlow",
  description:
    "Cold email templates, DM scripts, follow-ups, editable proposals and a lead tracker — the client outreach kit for Indian freelancers. ₹299 one-time payment.",
  alternates: { canonical: "/" },
};

/**
 * Product structured data.
 *
 * Deliberately has **no `aggregateRating` and no `review`** — those nodes are
 * the machine-readable version of "200+ customers", and inventing them is both
 * a Google policy violation (structured data spam) and a misleading claim.
 * They can be added the day real reviews exist.
 */
function productJsonLd() {
  const url = SITE.url.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: PRODUCT.name,
    description: PRODUCT.tagline,
    brand: { "@type": "Brand", name: "ClientFlow" },
    category: "Business & Productivity Software",
    image: `${url}/opengraph-image`,
    // The homepage is the product page: it states the price and links to buy,
    // and unlike /checkout it is indexable — so it is the URL to point at.
    url,
    offers: {
      "@type": "Offer",
      url,
      price: String(activePrice()),
      priceCurrency: PRICING.currency,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    // The kit is a bundle, so its parts are worth stating explicitly.
    additionalProperty: [
      { "@type": "PropertyValue", name: "Files included", value: String(FILE_COUNT) },
      { "@type": "PropertyValue", name: "Handbook pages", value: String(HANDBOOK_PAGES) },
      {
        "@type": "PropertyValue",
        name: "File list",
        value: INCLUDED_FILES.map((f) => f.name).join(", "),
      },
    ],
  };
}

const AUDIENCES: [string, string][] = [
  ["Freelance designers & developers", "Turn a portfolio site that waits for inbound into outreach that books calls."],
  ["SEO freelancers & agencies", "Sell monthly retainers with audit-led first-touch emails, not generic SEO spam."],
  ["Social media managers", "DM scripts built for the platform you already use all day."],
  ["Shopify developers & consultants", "A niche list approach for store owners with fixable revenue gaps."],
  ["Small digital agencies", "Standardise your team's outreach with the same sequences and scripts."],
  ["Starting solo after a job", "Templates that assume zero audience, zero case studies, zero warm intros."],
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd()) }}
      />
      <Hero />
      <NicheBand />
      <ProofBand />
      <Inside />
      <LookInside />
      <PipelineSection />
      <HowItWorks />

      {/* Who it's for */}
      <Section ariaLabel="Who this is for" className="border-t border-line">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <SectionHeading
                eyebrow="Who it's for"
                title={
                  <>
                    Built for the smallest
                    <br />
                    <span className="text-muted">teams with the biggest</span>
                    <br />
                    <span className="text-accent">opportunity.</span>
                  </>
                }
                description="Independent freelancers and 2–10 person studios who do client work for Indian SMBs — where deals are won by relevance and follow-through, not by headcount."
              />

              <Reveal delay={180} variant="up" className="mt-8">
                <div className="img-frame img-clip img-settle relative aspect-[16/10] shadow-[var(--shadow-lift)]">
                  <Image
                    src="/images/meeting.jpg"
                    alt="Two colleagues planning a project together over a laptop in a warm meeting room"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {AUDIENCES.map(([title, desc], i) => (
                <Reveal key={title} delay={Math.min((i % 2) * 90, 180)} variant="up">
                  <Spotlight className="card-lift h-full rounded-[var(--radius-card)] border border-line bg-paper p-5 md:p-6">
                    <p className="text-[0.95rem] font-semibold leading-snug text-ink">{title}</p>
                    <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">{desc}</p>
                    <p className="eyebrow mt-3 !text-[0.6rem]">{`For you ${i < 4 ? "— primary" : "— also"}`}</p>
                  </Spotlight>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <SampleTeaser />

      {/* FAQ */}
      <Section
        ariaLabel="Frequently asked questions"
        id="faq"
        className="relative isolate overflow-hidden border-t border-line bg-paper"
      >
        <FaqBackdrop />
        <Container className="relative">
          <div className="lg:max-w-[34rem]">
            <SectionHeading eyebrow="FAQ" title="Questions, answered plainly." />
            <div className="mt-10">
              <FaqSection tone="glass" />
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
