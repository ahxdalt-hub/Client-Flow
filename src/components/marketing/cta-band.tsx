"use client";

import Image from "next/image";

import { ButtonLink, Container } from "../ui";
import { Reveal, Magnetic } from "../motion";
import { Grain } from "../art/ambient";
import { BuyCta } from "./buy-cta";
import { activePrice } from "@/lib/pricing";
import { PAYMENTS_LIVE } from "@/lib/payments-status";

/**
 * Final CTA. The emotional close: a warm photograph behind ink, one clear
 * ask, and the risk-reversal restated where the decision happens.
 */
export function CtaBand() {
  return (
    <section
      aria-label="Get the kit"
      className="relative isolate overflow-hidden border-t border-line bg-ink"
    >
      <Image
        src="/images/team.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-35"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.82)_0%,rgba(20,17,14,0.94)_100%)]" />
      <Grain className="z-0" opacity={0.4} />

      <Container className="relative z-10 py-20 text-center md:py-28">
        <Reveal variant="up">
          <h2 className="display mx-auto max-w-2xl text-[clamp(2rem,4.5vw,3.2rem)] text-ivory">
            Your next client is reading <span className="text-accent">one inbox over.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[1.02rem] leading-relaxed text-ivory/70">
            Write to them today. The kit gives you every word — the price is one
            small project you haven&apos;t landed yet.
          </p>
        </Reveal>

        <Reveal
          variant="up"
          delay={120}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Magnetic className="inline-flex w-full justify-center sm:w-auto" strength={0.18}>
            <BuyCta
              location="footer-cta"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto"
            >
              Get the kit — ₹{activePrice()}
            </BuyCta>
          </Magnetic>
          <ButtonLink
            href="/sample"
            variant="ghost"
            size="lg"
            className="btn-on-dark w-full sm:w-auto"
          >
            Or start with the free sample
          </ButtonLink>
        </Reveal>

        <Reveal variant="fade" delay={220} className="mt-6">
          <p className="text-[0.78rem] text-ivory/45">
            Secure checkout via Razorpay{PAYMENTS_LIVE ? " · instant download" : ""}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
