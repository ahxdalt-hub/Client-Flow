import type { Metadata } from "next";
import Link from "next/link";

import { PRODUCT, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of use & digital licence",
  description: `Terms of use and digital-product licensing terms for the ${SITE.name} Research Pack.`,
  alternates: { canonical: "/terms" },
};

function LegalReviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-6 rounded-xl border border-dashed border-warning-line bg-warning-soft p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-warning-ink">
        Requires legal review
      </p>
      <p className="mt-2 text-sm leading-relaxed text-warning-ink/90">
        {children}
      </p>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-8 last:border-b-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  const updated = "14 October 2026";

  return (
    <div className="container-page max-w-3xl py-14 md:py-24">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-ink">Terms</li>
        </ol>
      </nav>

      <h1 className="display-title text-[clamp(2rem,4.6vw,2.9rem)]">
        Terms of use
      </h1>
      <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>

      <LegalReviewNotice>
        These terms are a working draft for the {SITE.name} storefront. Have
        them reviewed by a qualified professional before selling, especially
        the licence, liability, and governing-law sections, and fill in the
        operator details for your business entity.
      </LegalReviewNotice>

      <p className="mt-8 text-pretty text-[15px] leading-relaxed text-ink-soft">
        These terms govern your use of the {SITE.name} website and your
        purchase of the {PRODUCT.name} (the &ldquo;Pack&rdquo;), operated by{" "}
        {SITE.owner}. By using the site or purchasing the Pack, you agree to
        these terms.
      </p>

      <div className="mt-10">
        <Section title="1. The product">
          <p>
            The Pack is a one-time digital purchase: research files delivered
            as a download in spreadsheet formats. It is not a subscription, not
            a SaaS service, and includes no account, dashboard, or ongoing data
            updates unless explicitly stated at the time of purchase.
          </p>
          <p>
            Exact contents (record count, geographic scope, freshness policy)
            are published on the site before launch. If a specification is
            marked &ldquo;to be confirmed&rdquo;, it is not yet part of the
            product.
          </p>
        </Section>

        <Section title="2. Licence">
          <p>
            Upon purchase, you receive a limited, non-exclusive, non-transferable
            licence to use the Pack for your own business purposes — your own
            prospecting, research, and outreach.
          </p>
          <p>You may not:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Resell, redistribute, publish, or share the files, in full or in
              part, including as part of another list, product, or service.
            </li>
            <li>
              Upload the files to public repositories, shared drives outside
              your organisation, or file-sharing services.
            </li>
            <li>
              Claim the research as your own original work for resale.
            </li>
            <li>
              Use the files for unlawful purposes, harassment, or spam.
            </li>
          </ul>
          <p>
            You may keep internal working copies and add your own notes for your
            own use.
          </p>
          <LegalReviewNotice>
            Confirm the licence scope matches your intent (for example whether
            small teams inside one company may share a copy, and seat limits),
            and align this section with the Refunds page.
          </LegalReviewNotice>
        </Section>

        <Section title="3. Nature of the research">
          <p>
            Research rows describe publicly observable information about stores
            as of a stated research date. Notes are observations, not
            professional audits, diagnoses, or guarantees. No client, revenue,
            or reply outcome is promised. You are responsible for your own
            review of any store before contacting it, and for complying with
            applicable outreach and privacy laws in your jurisdiction.
          </p>
        </Section>

        <Section title="4. Purchases and delivery">
          <p>
            Prices are listed in Indian Rupees (₹) unless stated otherwise. The
            Pack is delivered as a digital download after payment confirmation.
            Checkout is not live until the payment provider is connected and
            tested; until then no purchase can be completed on this site.
          </p>
        </Section>

        <Section title="5. Refunds">
          <p>
            Digital-product refund handling is described on the{" "}
            <Link
              href="/refunds"
              className="font-medium text-accent underline underline-offset-4"
            >
              Refunds page
            </Link>
            , which forms part of these terms.
          </p>
        </Section>

        <Section title="6. Disclaimers and liability">
          <p>
            The site and Pack are provided &ldquo;as is&rdquo;. To the maximum
            extent permitted by law, {SITE.owner} disclaims warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement, and is not liable for indirect, incidental, or
            consequential damages arising from use of the Pack.
          </p>
          <LegalReviewNotice>
            Have the liability cap and warranty disclaimers reviewed for
            enforceability in your jurisdiction, and add a governing-law /
            dispute-resolution clause.
          </LegalReviewNotice>
        </Section>

        <Section title="7. Changes to terms">
          <p>
            These terms may be updated. The version published on this page at
            the time of your purchase applies to that purchase.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Questions about these terms:{" "}
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="font-medium text-accent underline underline-offset-4"
            >
              {SITE.contactEmail}
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
