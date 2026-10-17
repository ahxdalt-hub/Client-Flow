"use client";

import Image from "next/image";
import { useState } from "react";

import { Parallax, Reveal } from "@/components/motion";
import { cn } from "@/lib/cn";
import { PRICING } from "@/lib/pricing";

export const FAQS = [
  {
    q: "Is this useful if I'm just starting out?",
    a: "Yes — the kit assumes you have no 'past work' to show off yet. The Quick-Start Guide walks you through a simple approach: pick one problem you can solve for a niche, then use the templates to talk to fifteen real businesses about that problem.",
  },
  {
    q: "How are the files delivered?",
    a: "After payment you get a secure download link instantly, and the same link is emailed to you. The download stays active for 30 days.",
  },
  {
    q: "What do I need to open the files?",
    a: "A PDF reader, Word (or Google Docs) and a spreadsheet app (Excel or Google Sheets) — that's it. The templates live in the handbook PDF and editable DOCX files; the lead tracker imports into Google Sheets keeping its dropdowns and dashboard.",
  },
  {
    q: "Is the payment secure?",
    a: `Payments are handled entirely by Razorpay — UPI and all major cards. Your payment details go directly to Razorpay; this site never sees them. You pay ₹${PRICING.introActive ? PRICING.intro : PRICING.regular} and we never receive or store card data.`,
  },
  {
    q: "What if the kit doesn't help me?",
    a: "Use the material for up to 10 days. If it doesn't sharpen how you approach client outreach, write to us and we'll refund you in full.",
  },
  {
    q: "Will I get updates?",
    a: "Yes. Every future version of the kit is included free. When we improve templates or add a module, your download link keeps you current.",
  },
  {
    q: "Can my agency team share the files?",
    a: "The standard license covers one person. If 3+ people on your team want the kit, write to us and we'll set up a proper team purchase.",
  },
];

/**
 * Scroll-reactive backdrop for the FAQ section.
 *
 * The photograph is our own extended render of the question-mark still —
 * the wall and podium carry on past the original frame, so the picture can
 * reach the right edge of the viewport and fill it instead of leaving bare
 * paper there. It is anchored right, sized so it always tucks in behind the
 * accordion, and the image covers its box so nothing is ever letterboxed.
 * Its edges are masked rather than hard-cut, so the teal dissolves into the
 * page, and a soft radial wash carries the colour behind the accordion. It
 * drifts against the scroll via <Parallax>.
 *
 * Decorative only: aria-hidden, and no pointer events.
 */
export function FaqBackdrop() {
  return (
    <div className="faq-bg" aria-hidden="true">
      <div className="faq-bg-glow" />
      <div className="faq-bg-art">
        <Parallax speed={46} className="faq-bg-parallax">
          <Image
            src="/images/faq-question-mark-wide.png"
            alt=""
            width={980}
            height={980}
            quality={90}
            sizes="(min-width: 1024px) min(calc(50vw + 156px), calc(100vw - 464px)), 100vw"
            className="faq-bg-img"
          />
        </Parallax>
      </div>
    </div>
  );
}

/**
 * Accessible accordion FAQ (grid-rows animation, arrow-key friendly).
 * Rows stagger in on scroll; the index and icon warm to the accent as a
 * row takes focus.
 */
export function FaqSection({
  className,
  tone = "paper",
}: {
  className?: string;
  /** `glass` is for layouts that sit on <FaqBackdrop />. */
  tone?: "paper" | "glass";
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div
      className={
        className ??
        cn(
          "mx-auto max-w-3xl divide-y divide-line rounded-[var(--radius-card)] border border-line px-6 md:px-8",
          tone === "glass" ? "faq-glass" : "bg-paper",
        )
      }
    >
      {FAQS.map((item, i) => (
        <Reveal key={item.q} delay={Math.min(i * 55, 280)} y={14}>
          <div className="faq-item py-1" data-open={open === i}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-panel-${i}`}
              className="flex w-full items-center justify-between gap-6 py-4 text-left"
            >
              <span className="flex min-w-0 items-baseline gap-3 md:gap-4">
                <span className="faq-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.98rem] font-semibold text-ink">{item.q}</span>
              </span>
              <svg
                className="faq-icon shrink-0 text-muted"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <div className="faq-answer" id={`faq-panel-${i}`} role="region">
              <div>
                <p className="pb-5 pr-10 text-[0.9rem] leading-relaxed text-muted">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
