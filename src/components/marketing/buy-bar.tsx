"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { activePrice, PRICING } from "@/lib/pricing";
import { subscribeScroll } from "@/lib/scroll-loop";
import { useScrolledPast } from "@/components/motion";
import { play } from "@/lib/sound";

/**
 * Sticky purchase bar.
 *
 * Appears once the hero is behind you and stays until the visitor converts —
 * on a one-product page this is the highest-leverage element, because the
 * price and the buy button are never more than a glance away.
 *
 * Two guards keep it from becoming an annoyance rather than an aid:
 *  - it retracts near the foot of the page, so it never covers the final CTA
 *    (which is a better close anyway);
 *  - it is absent on checkout/order flows, and dismissible.
 */
export function BuyBar() {
  const pathname = usePathname();
  const pastHero = useScrolledPast(780);
  const [nearFooter, setNearFooter] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const remaining = doc.scrollHeight - (window.scrollY + window.innerHeight);
      setNearFooter(remaining < 460);
    };
    return subscribeScroll(update);
  }, []);

  const suppressed =
    !!pathname &&
    (pathname.startsWith("/checkout") || pathname.startsWith("/order"));
  const show = pastHero && !nearFooter && !suppressed && !dismissed;

  return (
    <div className="buy-bar" data-visible={show} aria-hidden={!show}>
      <div className="border-t border-line bg-ivory/85 shadow-[0_-14px_40px_-24px_rgba(20,17,14,0.4)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.82rem] font-semibold text-ink sm:text-[0.9rem]">
              ClientFlow Outreach Kit
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-[0.72rem] text-muted sm:text-[0.78rem]">
              <span className="font-semibold text-ink">₹{activePrice()}</span>
              <s className="opacity-70">₹{PRICING.regular}</s>
              <span aria-hidden="true">·</span>
              <span className="hidden sm:inline">
                one-time · instant download · 10-day refund
              </span>
              <span className="sm:hidden">one-time · instant</span>
            </p>
          </div>

          <Link
            href="/checkout"
            data-sound="off"
            onClick={() => play("pop")}
            className="btn btn-primary inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-5 text-[0.88rem] font-semibold sm:h-11 sm:px-6 sm:text-[0.94rem]"
          >
            Get the kit
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              play("press");
            }}
            data-sound="off"
            aria-label="Dismiss the buy bar"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
