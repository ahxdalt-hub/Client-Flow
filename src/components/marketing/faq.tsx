"use client";

import { useState } from "react";
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

/** Accessible accordion FAQ (grid-rows animation, arrow-key friendly). */
export function FaqSection({ className }: { className?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div
      className={
        className ??
        "mx-auto max-w-3xl divide-y divide-line rounded-[var(--radius-card)] border border-line bg-paper px-6 md:px-8"
      }
    >
      {FAQS.map((item, i) => (
        <div key={item.q} className="faq-item py-1" data-open={open === i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`faq-panel-${i}`}
            className="flex w-full items-center justify-between gap-6 py-4 text-left"
          >
            <span className="text-[0.98rem] font-semibold text-ink">{item.q}</span>
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
      ))}
    </div>
  );
}
