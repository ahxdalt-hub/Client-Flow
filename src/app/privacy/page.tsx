import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `Privacy policy for the ${SITE.name} digital storefront operated by ${SITE.owner}.`,
  alternates: { canonical: "/privacy" },
};

function LegalReviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <aside className="not-prose my-6 rounded-xl border border-dashed border-warning-line bg-warning-soft p-4">
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
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-line py-8 last:border-b-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
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
          <li className="font-medium text-ink">Privacy</li>
        </ol>
      </nav>

      <h1 className="display-title text-[clamp(2rem,4.6vw,2.9rem)]">
        Privacy policy
      </h1>
      <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>

      <LegalReviewNotice>
        This policy is a working draft prepared for the storefront. Before the
        site accepts payments or personal data at scale, it should be reviewed
        by a qualified professional for your jurisdiction, and the operator
        details, hosting vendors, and payment provider sections should be
        completed with the actual services you use.
      </LegalReviewNotice>

      <p className="mt-8 text-pretty text-[15px] leading-relaxed text-ink-soft">
        This policy explains what information is collected when you visit the{" "}
        {SITE.name} website (operated by {SITE.owner}), why it is collected,
        and the choices available to you. {SITE.name} sells a one-time digital
        research pack; it is not a SaaS application and does not provide user
        accounts.
      </p>

      <div className="mt-10">
        <Section id="collect" title="1. Information we collect">
          <p>
            <strong className="font-semibold text-ink">
              Information you provide:
            </strong>{" "}
            If you contact us via the contact page or email, we receive the
            contents of your message and the address you use to send it.
          </p>
          <p>
            <strong className="font-semibold text-ink">
              Purchase information:
            </strong>{" "}
            When checkout is enabled, payment processing is handled by a
            third-party payment provider. Card numbers and full payment details
            are handled by that provider and are not stored on this website.
          </p>
          <p>
            <strong className="font-semibold text-ink">
              Automatic information:
            </strong>{" "}
            Standard server and hosting logs may include IP address, browser
            type, and pages requested, used for security and reliability.
          </p>
        </Section>

        <Section id="use" title="2. How we use information">
          <ul className="list-disc space-y-2 pl-5">
            <li>To respond to support and pre-purchase questions.</li>
            <li>To deliver purchased digital files and resolve delivery issues.</li>
            <li>To maintain the security and reliability of the website.</li>
            <li>To comply with legal obligations, including tax and accounting.</li>
          </ul>
        </Section>

        <Section id="sharing" title="3. Sharing and processors">
          <p>
            Information is shared only with service providers needed to operate
            the storefront — for example the hosting provider, and the payment
            provider once checkout is enabled. Personal data is not sold.
          </p>
          <LegalReviewNotice>
            List the exact vendors here (hosting, payment provider, email,
            analytics if any) once they are chosen, and confirm each vendor&apos;s
            data-processing terms.
          </LegalReviewNotice>
        </Section>

        <Section id="payments" title="4. Payments (when enabled)">
          <p>
            Checkout is not live on this site at the time of writing. When a
            payment provider is connected, payments will be processed by that
            provider under its own privacy policy. This site will not store card
            details.
          </p>
        </Section>

        <Section id="cookies" title="5. Cookies and local storage">
          <p>
            The site may use essential storage only — for example remembering a
            preference you set on the device. No advertising or cross-site
            tracking cookies are used by this storefront in its current design.
          </p>
        </Section>

        <Section id="rights" title="6. Your rights">
          <p>
            Depending on your location, you may have rights to access, correct,
            or delete personal information held about you, and to object to or
            restrict certain processing. To make a request, contact{" "}
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="font-medium text-accent underline underline-offset-4"
            >
              {SITE.contactEmail}
            </a>
            .
          </p>
          <LegalReviewNotice>
            Add region-specific wording (for example GDPR or DPDP Act
            requirements) after confirming which jurisdictions your customers
            are in.
          </LegalReviewNotice>
        </Section>

        <Section id="retention" title="7. Retention">
          <p>
            Contact messages and purchase records are kept only as long as
            needed for support, accounting, and legal obligations, then deleted
            or anonymised.
          </p>
        </Section>

        <Section id="changes" title="8. Changes to this policy">
          <p>
            This policy may be updated as the storefront changes. The last
            updated date at the top of this page will reflect the current
            version.
          </p>
        </Section>

        <Section id="contact" title="9. Contact">
          <p>
            Questions about this policy:{" "}
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
