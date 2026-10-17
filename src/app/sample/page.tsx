import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { Container, Section, Badge, ButtonLink } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { Aurora } from "@/components/art/ambient";
import { activePrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Free sample — read a full template first",
  description:
    "Download the free ClientFlow sample PDF: the first cold-email template in full, one WhatsApp script, the follow-up system and the week-one quick-start. Free, instant, no email required.",
  alternates: { canonical: "/sample" },
};

const WHATS_IN_IT = [
  {
    name: "ClientFlow-Sample.pdf",
    desc: "Template 01 with its subject lines, personalisation fields, checklist, worked example and do-not-use list — plus one WhatsApp script and the follow-up system in brief.",
  },
  {
    name: "Week-one quick-start",
    desc: "Pick a lane, list 15 businesses, send 5 a day — the same route the paid kit starts with.",
  },
  {
    name: "What's in the full kit",
    desc: "A contents page showing exactly what the five paid files contain.",
  },
];

export default function SamplePage() {
  return (
    <div className="relative isolate overflow-hidden">
      <Aurora className="z-0" />
      <Container className="relative z-10 py-20 md:py-28">
      <nav aria-label="Breadcrumb" className="mb-10 text-[0.82rem] text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-ink">Free sample</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <Reveal>
            <Badge tone="tint">Free download</Badge>
            <h1 className="display mt-5 text-[clamp(2.2rem,5vw,3.4rem)] text-ink">
              One real template,
              <br />
              <span className="text-muted">from the paid kit.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-muted">
              No email gate, no drip sequence, no &ldquo;checkout to download&rdquo;
              theatre. One click, one PDF — the same quality you&apos;d pay for.
            </p>
            <a
              href="/downloads/clientflow-sample.pdf"
              download
              className="btn btn-primary mt-8 inline-flex h-[3.25rem] items-center gap-2.5 rounded-full px-8 text-[1rem] font-semibold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />
              </svg>
              Download sample — PDF
            </a>
            <p className="mt-3 text-[0.78rem] text-muted">
              1 designed PDF · ~500 KB · no signup, works offline
            </p>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className="rounded-[var(--radius-card)] border border-line bg-paper p-7">
            <p className="eyebrow">Inside the sample</p>
            <ul className="mt-4 divide-y divide-line">
              {WHATS_IN_IT.map((f) => (
                <li key={f.name} className="py-3.5 first:pt-0">
                  <p className="font-mono text-[0.8rem] text-ink">{f.name}</p>
                  <p className="mt-1 text-[0.84rem] leading-relaxed text-muted">{f.desc}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-ivory p-4 text-[0.84rem] leading-relaxed text-muted">
              If this earned a place in your outreach workflow, the full
              kit —{" "}
              <Link href="/#inside" className="text-accent underline underline-offset-2">
                20 templates · 10 scripts · 4 proposals · the tracker
              </Link>{" "}
              — costs less than one client won with it.
            </div>
            <ButtonLink href="/checkout" variant="primary" size="md" className="mt-5 w-full">
              Skip ahead — get the full kit ₹{activePrice()}
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <Reveal variant="up" className="mt-16">
        <div className="img-frame img-clip img-settle relative aspect-[16/9] shadow-[var(--shadow-lift)] sm:aspect-[21/9]">
          <Image
            src="/images/workspace.jpg"
            alt="A tidy desk with a laptop, notebook and a cup of coffee"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.05)_35%,rgba(20,17,14,0.74)_100%)]" />
          <p className="absolute inset-x-5 bottom-5 max-w-lg text-[0.95rem] font-medium leading-snug text-ivory sm:inset-x-7 sm:bottom-7 sm:text-[1.1rem]">
            Designed to be used at a desk like yours — on a Tuesday afternoon,
            with no time to spare.
          </p>
        </div>
      </Reveal>

      <Section className="!py-16">
        <div className="mx-auto max-w-2xl border-t border-line pt-10 text-center text-[0.9rem] text-muted">
          <p>
            The sample is genuinely an extract of the same handbook you get in
            the kit — not teaser fragments. That&apos;s the whole pitch: nothing
            here depends on what you can&apos;t verify for free.
          </p>
        </div>
      </Section>
      </Container>
    </div>
  );
}
