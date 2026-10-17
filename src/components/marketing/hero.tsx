import Image from "next/image";

import { ButtonLink, Container, Badge } from "../ui";
import { Reveal, Words, Tilt, Magnetic } from "../motion";
import { Aurora, Grain, GridField, SignalArcs } from "../art/ambient";
import { ProductMockup } from "./product-mockup";
import { ProofChip } from "./proof-chip";
import { BuyCta } from "./buy-cta";
import { activePrice, PRICING } from "@/lib/pricing";
import { PAYMENTS_LIVE } from "@/lib/payments-status";
import { getCustomerCount } from "@/lib/social-proof";

export async function Hero() {
  const customers = await getCustomerCount();

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
                <s className="font-normal opacity-70">₹{PRICING.regular}</s>
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

            {/* Proof then action. The chip is in normal flow rather than
                floating over the button, so it can never collide with the CTA
                on a narrow screen — and it states facts when there aren't yet
                real buyers to point at. */}
            <Reveal variant="up" delay={720} y={14} className="mt-7">
              <ProofChip customers={customers} />
            </Reveal>

            <Reveal
              variant="up"
              delay={780}
              y={14}
              className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Magnetic className="inline-flex" strength={0.22}>
                <BuyCta location="hero" size="lg">
                  Get the kit — ₹{activePrice()}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </BuyCta>
              </Magnetic>
              <ButtonLink href="/sample" variant="ghost" size="lg">
                Read the free sample first
              </ButtonLink>
            </Reveal>

            <Reveal variant="up" delay={860} y={10} className="mt-5">
              <p className="text-[0.82rem] text-muted">
                One-time payment · no subscription · the files are yours to keep
              </p>
            </Reveal>

            <Reveal
              variant="up"
              delay={900}
              y={10}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-6 text-[0.8rem] text-muted"
            >
              {PAYMENTS_LIVE ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <Check /> Instant download
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check /> UPI &amp; cards via Razorpay
                  </span>
                </>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Check /> 30-day download access
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
