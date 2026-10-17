import Image from "next/image";
import type { CSSProperties } from "react";

import { ButtonLink, Container, Badge } from "../ui";
import { Reveal, Words, Tilt, Magnetic } from "../motion";
import { Aurora, Grain, GridField, SignalArcs } from "../art/ambient";
import { ProductMockup } from "./product-mockup";
import { activePrice } from "@/lib/pricing";
import { getSoldCount, formatSoldCount } from "@/lib/social-proof";

/**
 * Faces shown on the hero's proof badge.
 *
 * NOTE — these are licensed stock portraits, not buyers. Swap each entry for a
 * real customer photo you have permission to use before this faces paid
 * traffic: a stock face sitting under a "bought by…" claim reads as that
 * person having bought the kit.
 *
 * Sources (Unsplash, free licence): 1580489944761-15a19d654956,
 * 1590086782957-93c06ef21604, 1494790108377-be9c29b29330, 1568602471122-7832951cc4c5.
 */
const BUYER_AVATARS = [
  "/images/avatars/avatar-01.jpg",
  "/images/avatars/avatar-02.jpg",
  "/images/avatars/avatar-03.jpg",
  "/images/avatars/avatar-04.jpg",
] as const;

export async function Hero() {
  const sold = await getSoldCount();

  return (
    <div className="relative isolate overflow-hidden border-b border-line">
      {/* ── Background photograph, washed into the ivory so type stays crisp ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/workspace.jpg"
          alt=""
          fill
          preload
          sizes="100vw"
          className="slow-zoom object-cover object-center opacity-[0.55]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,250,247,0.68)_0%,rgba(251,250,247,0.88)_55%,#fbfaf7_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fbfaf7_0%,rgba(251,250,247,0.72)_45%,rgba(251,250,247,0.15)_100%)]" />
      </div>

      {/* ── Ambient layers ── */}
      <GridField className="z-0 opacity-60" />
      <Aurora className="z-0" />
      <SignalArcs className="pointer-events-none absolute -right-32 top-1/2 z-0 hidden h-[34rem] w-[34rem] -translate-y-1/2 opacity-50 lg:block" />
      <Grain className="z-20" opacity={0.32} />

      <Container className="relative z-10 pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Copy column */}
          <div>
            <Reveal variant="fade" duration={900} className="mb-6">
              <Badge tone="tint">
                Introductory offer · ₹{activePrice()}{" "}
                <s className="font-normal opacity-70">₹499</s>
              </Badge>
            </Reveal>

            <h1 className="display text-[clamp(2.6rem,6vw,4.4rem)] text-ink">
              <span className="block">
                <Words text="Steady clients," delay={120} step={70} />
              </span>
              <span className="block">
                <Words text="not another" className="text-muted" delay={300} step={70} />{" "}
                <Words text="cold month." className="text-accent" delay={520} step={70} />
              </span>
            </h1>

            <Reveal variant="up" delay={620} y={16}>
              <p className="mt-6 max-w-lg text-[1.08rem] leading-relaxed text-muted">
                20 cold emails, 10 DM scripts, a four-step follow-up system,
                four proposals and a live lead tracker — the entire outreach
                system for Indian freelancers, in six files you can use today.
                <span className="text-ink"> Open, personalise, send.</span>
              </p>
            </Reveal>

            <Reveal
              variant="up"
              delay={740}
              y={14}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Magnetic className="inline-flex" strength={0.22}>
                <span className="relative inline-flex">
                  <ButtonLink
                    href="/checkout"
                    variant="primary"
                    size="lg"
                    data-analytics="cta-hero-buy"
                  >
                    Get the kit — ₹{activePrice()}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </ButtonLink>

                  {/* Social proof riding on the button itself — where the eye
                      already is when it decides. The number is the live floor
                      count, never a figure we can't stand behind. */}
                  <span
                    className="float-slow pointer-events-none absolute -top-6 right-0 z-10"
                    style={{ "--tilt": "-2deg" } as CSSProperties}
                  >
                    <span className="flex items-center gap-2.5 rounded-2xl border border-line-strong bg-paper/95 py-1.5 pl-1.5 pr-3 shadow-[var(--shadow-float)] backdrop-blur-md">
                      <span className="flex -space-x-1.5" aria-hidden="true">
                        {BUYER_AVATARS.map((src) => (
                          <Image
                            key={src}
                            src={src}
                            alt=""
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover ring-2 ring-paper"
                          />
                        ))}
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[0.72rem] font-semibold text-ink">
                          Bought by {formatSoldCount(sold)}
                        </span>
                        <span className="block text-[0.66rem] text-muted">
                          happy customers
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </Magnetic>
              <ButtonLink href="/sample" variant="ghost" size="lg">
                Read the free sample first
              </ButtonLink>
            </Reveal>

            <Reveal variant="up" delay={860} y={10} className="mt-5">
              <p className="text-[0.82rem] text-muted">
                One-time payment · no subscription · free updates forever
              </p>
            </Reveal>

            <Reveal
              variant="up"
              delay={900}
              y={10}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-6 text-[0.8rem] text-muted"
            >
              <span className="inline-flex items-center gap-1.5">
                <Check /> Instant download
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check /> UPI &amp; cards via Razorpay
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check /> 10-day refund promise
              </span>
            </Reveal>
          </div>

          {/* Mockup column */}
          <Reveal variant="scale" delay={280} y={24} className="relative mx-auto w-full max-w-[30rem] lg:max-w-none">
            <Tilt max={5}>
              <ProductMockup />
            </Tilt>
          </Reveal>
        </div>
      </Container>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-4 z-10 hidden justify-center md:flex"
      >
        <span className="scroll-cue" />
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg className="text-accent" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
