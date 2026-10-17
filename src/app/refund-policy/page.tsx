import type { Metadata } from "next";

import { LegalShell } from "@/components/legal-shell";
import { CONTACT, REFUND_WINDOW_DAYS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Refund policy",
  description: `The ${REFUND_WINDOW_DAYS}-day full refund promise on the ClientFlow Outreach Kit — how to ask, what happens.`,
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPage() {
  return (
    <LegalShell
      title="Refund policy"
      updated="October 2026"
      crumbs={[{ href: "/refund-policy", label: "Refunds" }]}
    >
      <p>
        The strongest guarantee we can write is also the simplest:
        <strong> use the kit for {REFUND_WINDOW_DAYS} days. If it doesn&apos;t help your
        outreach, ask for a refund and you&apos;ll get one — full stop.</strong>
      </p>

      <h2>How to ask</h2>
      <ul>
        <li>
          Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> with
          the subject &ldquo;Refund&rdquo;.
        </li>
        <li>
          Include your order ref (in your receipt email) — or just reply to
          that email.
        </li>
        <li>No form-filling, no calls, no over-explaining needed.</li>
      </ul>

      <h2>What happens</h2>
      <p>
        Refunds are processed to your original payment method through
        Razorpay. Banks usually take 5–7 working days to show it, and that
        part is their timing, not ours.
      </p>

      <h2>Boundary</h2>
      <p>
        Because one license covers one person, anyone who re-sells or
        re-publishes the kit forfeits the refund promise — that&apos;s the
        single condition.
      </p>

      <h2>Why so generous</h2>
      <p>
        Retail-refund rates on templates in this price band are typically tiny,
        and the kit is built to be used within a week. Your risk is genuinely
        low; this policy is us being able to say so out loud.
      </p>
    </LegalShell>
  );
}
