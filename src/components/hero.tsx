"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { PurchaseButton } from "@/components/purchase-button";
import { Reveal } from "@/components/reveal";
import {
  ILLUSTRATIVE_ROWS,
  SpreadsheetPreview,
} from "@/components/spreadsheet-preview";
import { CTA } from "@/config/site";
import { sound } from "@/lib/sound";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const HERO_COLUMNS = [
  "store",
  "url",
  "market",
  "opportunity",
  "status",
] as const;

const TRUST_ITEMS = [
  "Instant digital download",
  "One-time payment",
  "CSV + XLSX formats",
  "Free sample available",
] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    let disposed = false;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section || disposed) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${(progress * 70).toFixed(1)}px, 0)`;
      }
      if (mockRef.current) {
        mockRef.current.style.transform = `translate3d(0, ${(progress * -22).toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-line"
    >
      <div
        ref={bgRef}
        aria-hidden
        className="absolute -inset-x-0 -top-24 -bottom-32 will-change-transform"
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(214 205 188 / 0.55) 1px, transparent 1px), linear-gradient(to bottom, rgb(214 205 188 / 0.55) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 85% 70% at 55% 0%, black 25%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 70% at 55% 0%, black 25%, transparent 72%)",
          }}
        />
        <div
          className="absolute -top-40 left-1/2 h-[560px] w-[min(1100px,120%)] -translate-x-1/3 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(43 65 232 / 0.11), rgb(43 65 232 / 0.03), transparent)",
          }}
        />
      </div>

      <div className="container-page relative grid items-center gap-12 pb-16 pt-14 md:pb-24 md:pt-20 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-16 lg:pb-28 lg:pt-24">
        <div className="min-w-0">
          <Reveal>
            <p className="eyebrow inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-paper-raised/80 px-3 py-1.5 text-[10px] tracking-[0.1em] shadow-[0_6px_16px_-12px_rgb(25_23_19/0.4)] backdrop-blur-sm sm:text-[11px] sm:tracking-[0.14em]">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Digital research pack · One-time ₹199
            </p>
          </Reveal>

          <h1 className="display-title mt-6 text-[clamp(2.25rem,5.2vw,4rem)]">
            <span className="line-mask">
              <span className="line-inner" style={{ animationDelay: "0.05s" }}>
                Find your next
              </span>
            </span>
            <span className="line-mask">
              <span className="line-inner" style={{ animationDelay: "0.15s" }}>
                Shopify client without
              </span>
            </span>
            <span className="line-mask">
              <span className="line-inner" style={{ animationDelay: "0.25s" }}>
                starting from a{" "}
              </span>
              <span
                className="line-inner italic text-accent"
                style={{ animationDelay: "0.33s" }}
              >
                blank spreadsheet.
              </span>
            </span>
          </h1>

          <Reveal delay={400}>
            <p className="mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
              A structured research pack to help Shopify freelancers and
              agencies discover stores, organise prospects, and identify
              potential website-improvement opportunities.
            </p>
          </Reveal>

          <Reveal delay={500}>
            <div className="mt-8 flex flex-col gap-3 min-[26rem]:flex-row min-[26rem]:flex-wrap min-[26rem]:items-center">
              <PurchaseButton
                size="lg"
                label={CTA.primary.label}
                className="w-full min-[26rem]:w-auto"
              />
              <Link
                href="/sample"
                onClick={() => sound.tick()}
                className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line-strong bg-paper-raised/80 px-6 py-4 text-[15px] font-semibold text-ink backdrop-blur-sm transition-colors duration-300 hover:border-ink min-[26rem]:w-auto"
              >
                {CTA.secondary.label}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={600}>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-muted">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-soft text-accent ring-1 ring-accent/15"
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1.5 5.5 4 8l4.5-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="bleed-right relative min-w-0">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2rem] opacity-80 blur-2xl"
            style={{
              background:
                "radial-gradient(58% 55% at 55% 30%, rgb(43 65 232 / 0.1), transparent), radial-gradient(48% 48% at 25% 80%, rgb(214 205 188 / 0.45), transparent)",
            }}
          />

          <div ref={mockRef} className="relative will-change-transform">
            <div className="animate-rise [animation-delay:0.3s]">
              <SpreadsheetPreview
                frame="hero"
                columns={[...HERO_COLUMNS]}
                rows={ILLUSTRATIVE_ROWS.slice(0, 4)}
                selectedCell={{ row: 0, column: "opportunity" }}
                className="max-w-full"
              />
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted lg:text-left">
            Preview shows fictional example rows — not real store data.
          </p>
        </div>
      </div>
    </section>
  );
}
