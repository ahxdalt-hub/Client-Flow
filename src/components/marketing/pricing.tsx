"use client";

import { ButtonLink } from "../ui";
import { Reveal, Counter, Magnetic, Spotlight } from "../motion";
import { play } from "@/lib/sound";
import { track } from "@/lib/analytics-client";
import { activePrice, PRICING } from "@/lib/pricing";

const INCLUDED = [
  "66-page handbook — all 20 email templates",
  "10 DM scripts (5 WhatsApp + 5 LinkedIn)",
  "The 4-step follow-up system with objection replies",
  "4 editable proposals — website, SEO, social, Shopify",
  "Lead tracker for Excel & Google Sheets, with dashboard",
  "Quick-start guide + a complete worked example",
  "Every source editable — adapt before you send",
  "Free updates — keep every new version",
];

export function Pricing() {
  return (
    <section id="pricing" aria-label="Pricing" className="relative overflow-hidden border-t border-line py-20 md:py-28">
      <Reveal variant="scale" y={22}>
        <div className="relative isolate mx-auto max-w-4xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[calc(var(--radius-card)+32px)] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(66,87,245,0.16),transparent_70%)] blur-2xl"
          />
          <Spotlight className="overflow-hidden rounded-[calc(var(--radius-card)+8px)] border border-line bg-paper shadow-[var(--shadow-float)] md:grid md:grid-cols-[1.15fr_1fr]">
            {/* Price & pitch */}
            <div className="bg-ink p-8 text-ivory md:p-11">
              <p className="eyebrow !text-ivory/50">One-time payment</p>
              <div className="mt-4 flex items-end gap-3">
                <p className="display text-[4rem] leading-none">
                  ₹<Counter to={activePrice()} />
                </p>
                <p className="pb-2 text-[1.05rem] text-ivory/45">
                  <s>₹{PRICING.regular}</s>
                </p>
              </div>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-ivory/70">
                Introductory launch price. When the regular price returns, your
                copy and every future update stay yours — one payment, no
                subscription.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-ivory/15 px-3.5 py-1.5 text-[0.75rem] text-ivory/75">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                UPI, debit &amp; credit cards via Razorpay
              </p>
            </div>

            {/* Inclusions */}
            <div className="p-8 md:p-11">
              <h3 className="font-display text-[1.3rem] font-semibold text-ink">
                Everything included
              </h3>
              <ul className="mt-5 space-y-2.5">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.88rem] text-muted">
                    <svg className="mt-[3px] h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Magnetic strength={0.16} className="mt-8">
                <ButtonLink
                  href="/checkout"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  data-sound="off"
                  onClick={() => {
                    play("pop");
                    track("purchase_click", { location: "pricing-section" });
                  }}
                >
                  Get instant access — ₹{activePrice()}
                </ButtonLink>
              </Magnetic>
              <p className="mt-3.5 text-center text-[0.75rem] text-muted">
                Secure checkout · Download link issued immediately after payment ·{" "}
                <a href="/refund-policy" className="underline underline-offset-2 hover:text-ink">
                  10-day refund promise
                </a>
              </p>
            </div>
          </Spotlight>
        </div>
      </Reveal>
    </section>
  );
}
