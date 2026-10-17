"use client";

import type { ReactNode } from "react";

import { Container, Badge, ButtonLink } from "../ui";
import { Reveal } from "../motion";
import { PhotoBackdrop } from "../art/photo-backdrop";
import { play } from "@/lib/sound";
import { track } from "@/lib/analytics-client";
import { PRICING, activePrice } from "@/lib/pricing";
import { FILE_COUNT, HANDBOOK_PAGES } from "@/lib/product-content";

/**
 * The free-sample band.
 *
 * This is the trust section, so it does the one thing a trust section can:
 * it shows the goods instead of describing them. The backdrop is the desk
 * the sample gets read at — a laptop, a mug, an open notebook — veiled into
 * the ivory so the type stays crisp, and the preview panel is a real page
 * from the sample rather than a screenshot-shaped abstraction: template 01,
 * its two subject lines, one body line with its blanks marked, and the four
 * things the download actually contains.
 *
 * The bridge beneath it is the conversion step, and it is deliberately the
 * same glass surface as the preview above. The free proof and the ₹299 ask
 * are one continuous object, so the price is read as the next size of the
 * thing the reader is already holding — not as a new pitch. Every number in
 * the bridge comes from product-content.ts; the refund window from pricing.
 */

/** The four things the download genuinely contains, in the order the PDF has them. */
const SAMPLE_CONTENTS = [
  { n: "01", label: "email template, in full" },
  { n: "01", label: "WhatsApp script" },
  { n: "04", label: "follow-up steps, in brief" },
  { n: "01", label: "week-one quick-start" },
];

/** What the paid kit adds — the size of the step from free to ₹299. */
const KIT_LEDGER = [
  { n: "20", label: "cold email templates" },
  { n: "10", label: "WhatsApp & LinkedIn scripts" },
  { n: "04", label: "editable proposals" },
  { n: HANDBOOK_PAGES, label: "page handbook" },
];

/** A template's blank — what the reader fills in. Not decoration: it is the point. */
function Blank({ children }: { children: ReactNode }) {
  return <span className="sample-ph">{children}</span>;
}

function Tick() {
  return (
    <svg
      className="shrink-0 text-accent"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * A page of the sample, rendered as CSS rather than a screenshot, so it stays
 * sharp at any density and reads as the document it is. The content is real
 * — it comes from the same source the PDF is built from.
 */
function SamplePreview() {
  return (
    <article className="sample-panel">
      <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-tint text-accent">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2h9l5 5v15H6zM14 2v6h6" />
            </svg>
          </span>
          <div>
            <p className="font-mono text-[0.74rem] font-semibold text-ink">
              ClientFlow-Sample.pdf
            </p>
            <p className="text-[0.68rem] text-muted">
              1 designed PDF · opens anywhere
            </p>
          </div>
        </div>
        <Badge tone="tint">Free</Badge>
      </header>

      <div className="px-5 py-5">
        <div className="sample-sheet">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-line pb-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-[0.6rem] font-bold text-ivory">
                01
              </span>
              <p className="font-display text-[1.02rem] font-semibold leading-snug text-ink">
                The Website Fix Email
              </p>
            </div>
            <span className="eyebrow !text-[0.55rem] !tracking-[0.1em]">
              Template 01 of 20
            </span>
          </div>

          <p className="eyebrow mt-3.5 !text-[0.55rem]">Subject line options</p>
          <ul className="mt-2 space-y-1.5 text-[0.74rem] leading-snug text-ink">
            <li>
              One fix on <Blank>{"{{business}}"}</Blank>’s site that’s easy to miss
            </li>
            <li>
              Small bug on <Blank>{"{{website}}"}</Blank> (works fine on laptops,
              not phones)
            </li>
          </ul>

          <p className="mt-3.5 border-t border-line pt-3 text-[0.74rem] leading-relaxed text-muted">
            Hi <Blank>{"{{contact_name}}"}</Blank>, I tried to{" "}
            <Blank>{"{{the action their customer would take}}"}</Blank> on{" "}
            <Blank>{"{{website}}"}</Blank> and it broke…
          </p>

          <ul className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3 text-[0.68rem] text-muted">
            <li className="inline-flex items-center gap-1.5">
              <Tick /> Before-sending checklist
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Tick /> Filled example
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Tick /> Do-not-use list
            </li>
          </ul>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-3.5 border-t border-line px-5 py-4">
        {SAMPLE_CONTENTS.map((item) => (
          <div key={item.label} className="flex items-baseline gap-2.5">
            <dt className="display text-[1.05rem] leading-none text-accent">
              {item.n}
            </dt>
            <dd className="text-[0.76rem] leading-snug text-muted">
              {item.label}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function SampleTeaser() {
  return (
    <section
      aria-label="Free sample"
      className="relative isolate overflow-hidden border-t border-line"
    >
      <PhotoBackdrop
        src="/images/desk-warm.jpg"
        sizes="100vw"
        speed={46}
        objectPosition="center 58%"
        scrim={
          <>
            <span className="sample-scrim" />
            <span className="photo-cast" />
          </>
        }
      />

      <Container className="relative z-10 py-20 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <Reveal>
            <Badge tone="tint">Free · no email required</Badge>
            <h2 className="display mt-5 max-w-xl text-[clamp(1.9rem,4vw,2.9rem)] text-ink">
              Don&apos;t buy on faith.
              <br />
              <span className="text-muted">Read a real template first.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-muted">
              The free sample is a designed PDF pulled straight from the
              handbook — template 01 in full, one WhatsApp script, the
              follow-up system in brief and the week-one quick-start. Same
              files, same quality. The shortest possible proof.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/downloads/clientflow-sample.zip"
                download
                data-sound="off"
                onClick={() => {
                  play("open");
                  track("sample_download", { location: "sample-teaser" });
                }}
                className="btn btn-primary inline-flex h-[3.25rem] items-center gap-2.5 rounded-full px-7 text-[1rem] font-semibold"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />
                </svg>
                Download the sample
              </a>
              <span className="text-[0.78rem] text-muted">
                1 designed PDF · ~310 KB · no signup
              </span>
            </div>

            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-6 text-[0.8rem] text-muted">
              <li className="inline-flex items-center gap-1.5">
                <Tick /> Instant, ungated
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Tick /> Works offline
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Tick /> Yours to keep
              </li>
            </ul>
          </Reveal>

          <Reveal delay={150} variant="up" className="mx-auto w-full max-w-[34rem] lg:mx-0">
            <SamplePreview />
          </Reveal>
        </div>

        {/* ── The bridge: from the free page to the whole system ── */}
        <Reveal delay={120} y={22} className="mt-14 md:mt-16">
          <div className="sample-bridge">
            <div className="grid gap-9 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-14">
              <div>
                <p className="eyebrow">You&apos;ve just read one</p>
                <p className="display mt-3 max-w-lg text-[clamp(1.35rem,2.5vw,1.9rem)] text-ink">
                  The kit is the other nineteen — and everything that has to
                  happen after the first email.
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                  {KIT_LEDGER.map((item) => (
                    <div key={item.label}>
                      <dt className="display text-[1.6rem] leading-none text-ink">
                        {item.n}
                      </dt>
                      <dd className="mt-1.5 text-[0.74rem] leading-snug text-muted">
                        {item.label}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-6 text-[0.82rem] leading-relaxed text-muted">
                  {FILE_COUNT} files, one download. If the sample felt worth
                  keeping, the rest of the system is built to the same standard.
                </p>
              </div>

              <div className="lg:border-l lg:border-line lg:pl-14">
                <p className="flex items-baseline gap-2.5">
                  <span className="display text-[2.5rem] leading-none text-ink">
                    ₹{activePrice()}
                  </span>
                  {PRICING.introActive ? (
                    <span className="text-[0.9rem] text-muted">
                      <s>₹{PRICING.regular}</s> · introductory
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-[0.82rem] text-muted">
                  One-time payment · no subscription · free updates forever
                </p>

                <ButtonLink
                  href="/checkout"
                  variant="primary"
                  size="lg"
                  className="mt-5 w-full"
                  data-sound="off"
                  onClick={() => {
                    play("pop");
                    track("purchase_click", { location: "sample-teaser" });
                  }}
                >
                  Get the full kit — ₹{activePrice()}
                </ButtonLink>

                <ul className="mt-4 space-y-2 text-[0.78rem] text-muted">
                  <li className="inline-flex w-full items-center gap-2">
                    <Tick /> Instant download via Razorpay
                  </li>
                  <li className="inline-flex w-full items-center gap-2">
                    <Tick /> UPI &amp; all major cards
                  </li>
                  <li className="inline-flex w-full items-center gap-2">
                    <Tick /> 10-day refund promise, no questions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
