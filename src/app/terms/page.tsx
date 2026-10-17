import type { Metadata } from "next";

import { LegalShell } from "@/components/legal-shell";
import { CONTACT, REFUND_WINDOW_DAYS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The plain-language terms for buying and using the ClientFlow Outreach Kit.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of use"
      updated="October 2026"
      crumbs={[{ href: "/terms", label: "Terms" }]}
    >
      <p>
        These terms cover buying and using the ClientFlow Outreach Kit. Plain
        language, no traps — if you find something unfair in practice and not
        just in theory, write to us.
      </p>

      <h2>The product</h2>
      <p>
        You are buying a download: a zip archive of text/markdown templates
        and HTML tools, delivered through a secure link that stays valid for
        30 days. Payment is processed by Razorpay in Indian Rupees.
      </p>

      <h2>License</h2>
      <ul>
        <li>One purchase = one user. You may edit and use the templates for your own client work, unlimited times.</li>
        <li>You may not re-sell, re-bundle, publish or share the files (edited or original), including &ldquo;give it free&rdquo; lead magnets.</li>
        <li>Teams of 3+ need a team license — write to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> for one.</li>
      </ul>

      <h2>Updates</h2>
      <p>
        Your purchase includes future versions of this kit. Updated content
        is made available through your (or a reissued) download link.
      </p>

      <h2>Refunds</h2>
      <p>
        Covered in detail on the <a href="/refund-policy">refund policy</a>{" "}
        page. In short: if something failed on our side — the download never
        arrived, the files are broken or incomplete, or you were charged
        incorrectly — you get a full refund within {REFUND_WINDOW_DAYS} days of
        purchase. Change of mind after downloading isn&apos;t covered, because
        a download can&apos;t be returned.
      </p>

      <h2>No-guarantees clause</h2>
      <p>
        The kit is a set of professional templates and guides, not business
        consulting for your specific situation. We plainly can&apos;t promise
        that any individual will book N calls or close a specific deal — and
        no one selling files should. Your results depend on your niche,
        pricing, follow-through and market conditions.
      </p>

      <h2>Jurisdiction</h2>
      <p>
        Use of this product and any dispute is governed by Indian law, with
        courts in the operator&apos;s city of business having jurisdiction.
      </p>
    </LegalShell>
  );
}
