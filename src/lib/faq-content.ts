import { PRICING } from "./pricing";

/**
 * FAQ content, kept out of the client component so server code (metadata,
 * FAQPage structured data) can read the same answers the accordion renders.
 * One source of truth — if an answer changes here, it changes everywhere.
 */
export const FAQS = [
  {
    q: "Is this useful if I'm just starting out?",
    a: "Yes — the kit assumes you have no 'past work' to show off yet. The Quick-Start Guide walks you through a simple approach: pick one problem you can solve for a niche, then use the templates to talk to fifteen real businesses about that problem.",
  },
  {
    q: "How are the files delivered?",
    a: "After payment, your secure download link is shown on the confirmation page. It stays active for 30 days — save the page, and support can reissue it if you lose it.",
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
    q: "What if the kit isn't working for me?",
    a: "Write to us and we'll help you get value from it — a template swap, a niche suggestion, help adapting something to your situation. And if something failed on our side (the files arrived broken or incomplete, or never arrived at all), you get a full refund — that's set out on the refund policy page.",
  },
  {
    q: "Will I get updates?",
    a: "There's no fixed release schedule, so we don't promise ongoing updates — what you download is yours to keep. Your order page stays bookmarkable and the download link keeps working; if it ever stops, the recovery page reissues it.",
  },
  {
    q: "Can my agency team share the files?",
    a: "The standard license covers one person. If 3+ people on your team want the kit, write to us and we'll set up a proper team purchase.",
  },
];

/** FAQPage structured data built from the answers above. */
export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
