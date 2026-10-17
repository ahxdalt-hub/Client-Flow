"use client";

import Image from "next/image";

import { Container, Section, Badge } from "../ui";
import { Reveal } from "../motion";
import { Aurora } from "../art/ambient";
import { play } from "@/lib/sound";
import { track } from "@/lib/analytics-client";

/** Free sample band — the low-friction way in, with a tangible visual. */
export function SampleTeaser() {
  return (
    <Section
      ariaLabel="Free sample"
      className="relative isolate overflow-hidden border-t border-line"
    >
      <Aurora className="opacity-40" />
      <Container className="relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <Reveal>
            <Badge tone="line">Free · no email required</Badge>
            <h2 className="display mt-4 max-w-xl text-[clamp(1.9rem,4vw,2.9rem)] text-ink">
              Don&apos;t buy on faith.
              <br />
              <span className="text-muted">Read a real template first.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-muted">
              The free sample is a designed PDF: the handbook&apos;s first email
              template in full, one WhatsApp script, the follow-up system in
              brief and the week-one quick-start route. Same files, same quality
              — the shortest possible proof.
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
              <span className="text-[0.78rem] text-muted">~310 KB · ZIP · opens anywhere</span>
            </div>
          </Reveal>

          <Reveal delay={150} variant="up" className="relative mx-auto w-full max-w-[32rem] lg:mx-0">
            <div className="img-frame img-clip img-settle relative aspect-[4/3] shadow-[var(--shadow-float)]">
              <Image
                src="/images/desk-warm.jpg"
                alt="A notebook, pen and laptop on a wooden desk beside a cup of coffee"
                fill
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-5 flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 shadow-[var(--shadow-float)]">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-tint text-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2h9l5 5v15H6zM14 2v6h6" />
                </svg>
              </span>
              <div>
                <p className="font-mono text-[0.72rem] font-semibold text-ink">
                  ClientFlow-Sample.pdf
                </p>
                <p className="text-[0.68rem] text-muted">1 designed PDF · instant</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
