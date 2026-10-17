import type { Metadata } from "next";
import Image from "next/image";

import { Hero } from "@/components/marketing/hero";
import { NicheBand } from "@/components/marketing/niche-band";
import { ProofBand } from "@/components/marketing/proof-band";
import { Inside } from "@/components/marketing/inside";
import { LookInside } from "@/components/marketing/look-inside";
import { PipelineSection } from "@/components/marketing/pipeline-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { FaqSection } from "@/components/marketing/faq";
import { SampleTeaser } from "@/components/marketing/sample-teaser";
import { CtaBand } from "@/components/marketing/cta-band";
import { Section, SectionHeading, Container } from "@/components/ui";
import { Reveal, Spotlight } from "@/components/motion";

export const metadata: Metadata = {
  title: "ClientFlow Outreach Kit — client acquisition templates for Indian freelancers",
  description:
    "Cold email templates, DM scripts, follow-up sequences, proposals and pricing tools built for freelance designers, developers, SEOs, social media managers and agencies in India. ₹299 introductory price.",
  alternates: { canonical: "/" },
};

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
      <Hero />
      <NicheBand />
      <ProofBand />
      <Inside />
      <LookInside />
      <PipelineSection />
      <HowItWorks />
      <Pricing />

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
      <Section ariaLabel="Frequently asked questions" id="faq" className="border-t border-line bg-paper">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="FAQ"
            title="Questions, answered plainly."
          />
          <div className="mt-12">
            <FaqSection />
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
