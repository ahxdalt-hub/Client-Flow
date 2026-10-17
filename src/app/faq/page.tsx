import type { Metadata } from "next";

import { FaqBackdrop, FaqSection } from "@/components/marketing/faq";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about the ClientFlow Outreach Kit — delivery, licensing, pricing, refunds and support.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="relative isolate overflow-hidden border-b border-line">
      <FaqBackdrop />
      <Container className="relative py-16 md:py-24">
        <div className="lg:max-w-[34rem]">
          <SectionHeading
            eyebrow="FAQ"
            title="Everything people ask before buying."
            description="If something isn't covered here, the fastest answer comes from support — see Contact."
          />
          <div className="mt-10">
            <FaqSection tone="glass" />
          </div>
          <div className="pt-14">
            <ButtonLink href="/sample" variant="ghost" size="md">
              Still deciding? Try the free sample
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
