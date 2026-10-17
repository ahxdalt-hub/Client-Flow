import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui";
import { CONTACT } from "@/lib/pricing";
import { breadcrumbJsonLd, jsonLd } from "@/lib/structured-data";
import { SUPPORT_CATEGORIES } from "@/lib/support-topics";

export const metadata: Metadata = {
  title: "Contact & support",
  description:
    "Open a support ticket or email ClientFlow directly — payment problems, delivery issues, refunds and licensing questions, answered by a human.",
  alternates: { canonical: "/contact" },
};

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export default function ContactPage() {
  const topicCount = SUPPORT_CATEGORIES.reduce((n, c) => n + c.topics.length, 0);

  return (
    <div className="border-b border-line">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(TRAIL)) }}
      />
      <Container className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.82rem] text-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-ink">Contact</span>
          </nav>

          <p className="eyebrow">Support</p>
          <h1 className="display mt-3 text-[clamp(2rem,4.5vw,3rem)] text-ink">
            A one-person business,
            <br />
            <span className="text-muted">with one-person service.</span>
          </h1>

          <div className="mt-10 space-y-4">
            <Link
              href="/support"
              className="card-lift block rounded-[var(--radius-card)] border border-accent/40 bg-paper p-6"
            >
              <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-accent">
                Fastest — open a ticket
              </p>
              <p className="mt-1.5 text-[1.15rem] font-semibold text-ink">
                Tell us what went wrong
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
                Pick the category, pick the problem, describe it. {topicCount}{" "}
                problem types are covered, you get a ticket code straight away,
                and it lands in a queue we work in order — payment problems
                first.
              </p>
            </Link>

            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("ClientFlow support")}`}
              className="card-lift block rounded-[var(--radius-card)] border border-line bg-paper p-6"
            >
              <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted">
                Or just email us
              </p>
              <p className="mt-1.5 text-[1.15rem] font-semibold text-accent">
                {CONTACT.email}
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
                For download problems, refunds and licensing questions. Include
                your order ref (shown on your order confirmation page) when you
                have one — it makes replies faster.
              </p>
            </a>

            <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted">
                Response time
              </p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                Usually the same working day (IST), evenings and weekends
                included — we run lean and that shows up as responsiveness.
                Delivery and payment problems are always answered first.
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted">
                Before you write
              </p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                Download link expired?{" "}
                <Link href="/recover" className="text-accent underline underline-offset-2">
                  Recover it yourself
                </Link>{" "}
                in about ten seconds with your order code — no need to wait on us.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
