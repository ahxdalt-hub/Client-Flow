import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui";
import { Aurora } from "@/components/art/ambient";
import { CONTACT } from "@/lib/pricing";
import { breadcrumbJsonLd, jsonLd } from "@/lib/structured-data";
import { SUPPORT_CATEGORIES } from "@/lib/support-topics";

import { TicketForm } from "./ticket-form";

export const metadata: Metadata = {
  title: "Support — open a ticket",
  description:
    "Open a support ticket for the ClientFlow Outreach Kit. Payment problems, download issues, refunds, licensing and questions about the templates — answered by a human.",
  alternates: { canonical: "/support" },
};

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Support", path: "/support" },
];

/** Self-serve answers, so a ticket is only opened when it is actually needed. */
const QUICK_FIXES = [
  {
    title: "Your download link expired",
    body: "Links are valid for 30 days. Enter your order code or payment id and get a fresh one instantly — no waiting on us.",
    href: "/recover",
    cta: "Recover a download",
  },
  {
    title: "You don't know where to start",
    body: "The first template and the week-one plan are in the free sample. Most setup questions are answered there.",
    href: "/sample",
    cta: "Open the free sample",
  },
  {
    title: "You want to know about refunds",
    body: "The refund policy says exactly what is covered, what isn't, and how long it takes.",
    href: "/refund-policy",
    cta: "Read the refund policy",
  },
  {
    title: "The answer might already be written",
    body: "Delivery, licensing, pricing and update questions are all answered in the FAQ.",
    href: "/faq",
    cta: "Read the FAQ",
  },
];

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; topic?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const topicCount = SUPPORT_CATEGORIES.reduce((n, c) => n + c.topics.length, 0);

  return (
    <div className="relative isolate overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(TRAIL)) }}
      />
      <Aurora className="z-0" />
      <Container className="relative z-10 py-16 md:py-24">
        <nav aria-label="Breadcrumb" className="mb-10 text-[0.82rem] text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-ink">Support</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* ── Left: framing + self-serve ───────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">Support</p>
            <h1 className="display mt-4 text-[clamp(2.1rem,4.6vw,3.1rem)] text-ink">
              Tell us what broke.
            </h1>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-muted">
              Pick the category, pick the problem, describe it in your own words.
              You get a ticket code straight away, and a real person reads it —
              {" "}
              {topicCount} problem types are covered, so one of them will fit.
            </p>

            <p className="mt-5 text-[0.9rem] leading-relaxed text-muted">
              Prefer email? Write to{" "}
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("ClientFlow support")}`}
                className="font-semibold text-accent underline underline-offset-2"
              >
                {CONTACT.email}
              </a>
              . Tickets opened here reach the same inbox, with the details
              already arranged.
            </p>

            <div className="mt-10">
              <p className="eyebrow">Try these first</p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
                Most requests are one of these four, and all four are answered
                instantly without waiting for anyone.
              </p>
              <ul className="mt-4 space-y-3">
                {QUICK_FIXES.map((fix) => (
                  <li key={fix.href}>
                    <Link
                      href={fix.href}
                      className="card-lift block rounded-[var(--radius-card)] border border-line bg-paper p-4"
                    >
                      <p className="text-[0.9rem] font-semibold text-ink">
                        {fix.title}
                      </p>
                      <p className="mt-1 text-[0.82rem] leading-relaxed text-muted">
                        {fix.body}
                      </p>
                      <p className="mt-2 text-[0.82rem] font-semibold text-accent">
                        {fix.cta} →
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right: the ticket form ──────────────────────────── */}
          <div className="rounded-[var(--radius-card)] border border-line bg-ivory p-5 shadow-[var(--shadow-lift)] sm:p-7 md:p-8">
            <TicketForm
              initial={{ order: sp.order, topic: sp.topic, email: sp.email }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
