import type { Metadata } from "next";
import Link from "next/link";

import { FaqBackdrop, FaqSection } from "@/components/marketing/faq";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { faqPageJsonLd } from "@/lib/faq-content";
import { breadcrumbJsonLd, jsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "FAQ — delivery, licensing, refunds",
  description:
    "Answers about the ClientFlow Outreach Kit: what's included, how the ₹299 one-time payment works, how the files are delivered, refund terms and how to reach support.",
  alternates: { canonical: "/faq" },
};

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "FAQ", path: "/faq" },
];

export default function FaqPage() {
  return (
    <div className="relative isolate overflow-hidden border-b border-line">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(TRAIL)) }}
      />
      <FaqBackdrop />
      <Container className="relative py-16 md:py-24">
        <div className="lg:max-w-[34rem]">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.82rem] text-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-ink">FAQ</span>
          </nav>
          <SectionHeading
            as="h1"
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
