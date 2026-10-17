import type { Metadata } from "next";

import { Container, Section, SectionHeading } from "@/components/ui";
import { FaqSection } from "@/components/marketing/faq";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about the ClientFlow Outreach Kit — delivery, licensing, pricing, refunds and support.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="border-b border-line">
      <Container className="py-16 md:py-24">
        <SectionHeading
          eyebrow="FAQ"
          title="Everything people ask before buying."
          description="If something isn't covered here, the fastest answer comes from support — see Contact."
        />
        <div className="mt-12">
          <FaqSection />
        </div>
        <Section className="!py-14 text-center">
          <ButtonLink href="/sample" variant="ghost" size="md">
            Still deciding? Try the free sample
          </ButtonLink>
        </Section>
      </Container>
    </div>
  );
}
