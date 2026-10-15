import type { Metadata } from "next";
import Link from "next/link";

import { PRODUCT, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund policy",
  description: `Refund policy for the ${SITE.name} ${PRODUCT.name}, a digital download.`,
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
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
          <li className="font-medium text-ink">Refunds</li>
        </ol>
      </nav>

      <h1 className="display-title text-[clamp(2rem,4.6vw,2.9rem)]">
        Refund policy
      </h1>
      <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>

      <div className="mt-8 space-y-6 text-pretty text-[15px] leading-relaxed text-ink-soft">
        <p>
          The {PRODUCT.name} is an intangible digital product delivered by
          download. Because the files are delivered electronically and cannot be
          &ldquo;returned&rdquo;, refunds are handled differently than for
          physical goods. This page explains what that means in practice.
        </p>
      </div>

      <div className="mt-10 space-y-0">
        {[
          {
            title: "When a refund is available",
            body: [
              "You paid but never received access to the download — payment confirmed by the provider, delivery failed, and the issue is not resolved within a reasonable time after you contact support.",
              "The delivered files are corrupt or incomplete and cannot be opened, and a corrected file is not provided.",
              "The product you received materially differs from the specifications published on this site at the time of purchase (for example, a published record count that the delivered file does not meet).",
            ],
          },
          {
            title: "When a refund is not available",
            body: [
              "You changed your mind after the download was delivered.",
              "You bought the pack by mistake and downloaded the files.",
              "Your outreach did not result in clients or revenue — the pack organises research and does not promise commercial outcomes.",
              "You can no longer use the files because of a device or software limitation on your side (the files are provided in common spreadsheet formats; contact support if you have trouble opening them before requesting a refund).",
            ],
          },
          {
            title: "How to request a refund",
            body: [
              `Email ${SITE.contactEmail} from the address used at purchase, with the subject line "Refund request", and include your payment reference or order ID.`,
              "Requests are reviewed individually. If approved, the refund is issued to the original payment method; processing time depends on the payment provider and your bank.",
              "There is no fixed deadline published here yet — the exact request window will be confirmed together with the payment provider before checkout goes live, and this page will be updated accordingly.",
            ],
          },
          {
            title: "Chargebacks",
            body: [
              "Please contact support first so issues can be resolved directly. Filing a chargeback for a delivered digital product may delay resolution and can result in access being revoked where delivery can be controlled.",
            ],
          },
          {
            title: "Consumer rights",
            body: [
              "This policy does not limit any non-waivable consumer rights that apply where you live. Where local law grants stronger rights than this policy, the law applies.",
            ],
          },
        ].map((block) => (
          <section key={block.title} className="border-b border-line py-7">
            <h2 className="text-lg font-semibold tracking-tight">
              {block.title}
            </h2>
            <ul className="mt-4 space-y-3">
              {block.body.map((line) => (
                <li key={line} className="flex gap-3 text-pretty text-[15px] leading-relaxed">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <aside className="mt-8 rounded-xl border border-dashed border-warning-line bg-warning-soft p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-warning-ink">
          Requires legal review
        </p>
        <p className="mt-2 text-sm leading-relaxed text-warning-ink/90">
          This policy is a working draft. Before checkout goes live, confirm the
          refund window with your payment provider, review the wording against
          consumer-protection rules in the jurisdictions you sell into, and make
          sure support can actually honour every commitment here.
        </p>
      </aside>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center rounded-xl border border-line-strong bg-paper-raised px-5 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink"
        >
          Contact support
        </Link>
        <Link
          href="/terms"
          className="inline-flex items-center rounded-xl px-5 py-3 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          Read the terms
        </Link>
      </div>
    </div>
  );
}
