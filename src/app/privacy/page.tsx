import type { Metadata } from "next";

import { LegalShell } from "@/components/legal-shell";
import { CONTACT } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What ClientFlow collects, why, and the minimal data we keep.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy policy"
      updated="October 2026"
      crumbs={[{ href: "/privacy", label: "Privacy" }]}
    >
      <p>
        Short version: this project only collects the minimum needed to sell
        you a file and help you if a download fails. No tracking pixel
        companies, no ad networks, no list brokers.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Order data</strong> — your name, email and optional phone
          number, stored with your order so we can deliver it, help if a
          download fails, and issue a receipt. Payment instrument data (card,
          UPI, netbanking credentials) is never stored — Razorpay holds that.
        </li>
        <li>
          <strong>First-party analytics</strong> — anonymous page-view and
          event counts (which pages are read, which buttons are clicked),
          stored on our own Supabase project. No cross-site identifiers, no
          selling data, no ad-tech cookies.
        </li>
        <li>
          <strong>Server logs</strong> — download requests are logged with a
          salted, truncated hash of your IP (not the raw address), for
          diagnosing abuse of expiring links.
        </li>
        <li>
          <strong>Payment data</strong> — handled wholly by Razorpay under
          their privacy policy. Card numbers, CVVs, VPA and PINs never reach
          our servers.
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell or rent personal data. Ever.</li>
        <li>We don&apos;t run ads or embed third-party tracking scripts.</li>
        <li>We don&apos;t add you to a newsletter at checkout — the only
        emails you get are order- and support-related.</li>
      </ul>

      <h2>Retention & deletion</h2>
      <p>
        Order records are kept for accounting reliability. Write to{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> to request a
        copy or deletion of your personal data; analytics entries are not
        linked to you and are purged with routine cleanups.
      </p>

      <h2>Third parties</h2>
      <p>
        Razorpay (payments), Vercel (hosting) and Supabase (our order and
        analytics database) each process strictly the data required for their
        function, under their own published policies.
      </p>
    </LegalShell>
  );
}
