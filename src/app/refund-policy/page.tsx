import type { Metadata } from "next";

import { LegalShell } from "@/components/legal-shell";
import { CONTACT, REFUND_WINDOW_DAYS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Refund policy",
  description: `The refund policy for the ClientFlow Outreach Kit — what is covered in full, what is not, and how to ask.`,
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
        We sell a download, so this page is short and specific rather than
        sweeping.{" "}
        <strong>
          If something failed on our side, you get a full refund — no argument
          and no back-and-forth.
        </strong>{" "}
        If the files reached you fine and you simply changed your mind, that
        isn&apos;t something a download can be returned for. Both halves are
        spelled out below so neither of us is guessing.
      </p>

      <h2>Covered in full</h2>
      <ul>
        <li>
          <strong>You paid and never got the files.</strong> The download link
          never arrived, expired before you could use it, or we couldn&apos;t
          reissue it.
        </li>
        <li>
          <strong>You were charged twice</strong>, or charged an amount
          different from the price shown at checkout.
        </li>
        <li>
          <strong>The files arrived broken or incomplete</strong> — the archive
          won&apos;t open, or something listed in the kit contents is missing.
        </li>
      </ul>

      <h2>Not covered</h2>
      <ul>
        <li>
          <strong>Change of mind after downloading.</strong> A download can&apos;t
          be handed back. Once the files are on your machine there is nothing
          for us to recover, so a refund isn&apos;t a cost we can absorb in that
          case. This is the reason the policy is written narrowly.
        </li>
        <li>
          <strong>Results.</strong> Whether a template gets replies depends on
          your niche, pricing and follow-through. We can&apos;t promise a
          specific outcome, and a disappointing outcome isn&apos;t a defect.
        </li>
        <li>
          <strong>Reselling or sharing the files</strong>, which breaks the
          license — see the <a href="/terms">terms</a>.
        </li>
      </ul>

      <h2>How to ask</h2>
      <p>
        Open a ticket at <a href="/support">/support</a> — choose{" "}
        <em>Refunds</em>, pick the problem, and your order code is attached for
        you. Prefer email? Write to{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> with the subject
        &ldquo;Refund&rdquo; and your order ref (shown on your order confirmation
        page). Tell us what you hit — a failed download, a missing file, a double
        charge. If it&apos;s one of the three cases above, we don&apos;t ask you to
        justify it any further.
      </p>

      <h2>Timing</h2>
      <p>
        Ask within {REFUND_WINDOW_DAYS} days of purchase, so we can check the
        delivery logs while they&apos;re still fresh. Refunds go back to your
        original payment method through Razorpay; banks usually take 5–7
        working days to show it, and that part is their timing, not ours.
      </p>

      <h2>After a refund</h2>
      <p>
        A refund ends the purchase, so your download link stops working at that
        point and the license goes with it. Files already saved to your machine
        stay there — a download can&apos;t be revoked, which is the same reason
        change of mind isn&apos;t covered above.
      </p>
    </LegalShell>
  );
}
