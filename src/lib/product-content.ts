/**
 * Editorial product content — single source of truth for the module list
 * shown on the site, the checkout page and the order page.
 *
 * Every count below matches the actual files generated from
 * assets/product-assets/ and packaged into the deliverable zip:
 *
 *   ClientFlow-Handbook.pdf      66 pages, all 6 parts below
 *   Email-Templates.docx         the 20 email templates + 10 DM scripts, editable
 *   Proposal-Templates.docx      4 editable proposals (10 sections each)
 *   Lead-Tracker.xlsx            dropdowns, conditional formats, dashboard, Read Me
 *   Quick-Start-Guide.pdf        the 4-page standalone quick-start
 *   README.md                    what each file is and how to use it
 */

export type Module = {
  id: string;
  index: string;
  title: string;
  blurb: string;
  points: string[];
  count: string;
  kind: "email" | "script" | "doc" | "tool";
};

export const MODULES: Module[] = [
  {
    id: "cold-email",
    index: "01",
    title: "Handbook — 20 cold email templates",
    blurb:
      "A designed 66-page handbook where every template earns its place: audience, use case, checklist, filled example — and when not to send it.",
    points: [
      "20 distinct templates — fixes, SEO gaps, social, Shopify, reconnects, close-the-loop",
      "2 subject-line options per template",
      "A filled fictional example + do-not-use list for each",
    ],
    count: "20 templates",
    kind: "email",
  },
  {
    id: "dm-scripts",
    index: "02",
    title: "WhatsApp & LinkedIn scripts",
    blurb:
      "Ten first-touch DM scripts written for how the two platforms are actually used in India — no fabricated familiarity, no fake mutuals.",
    points: [
      "5 WhatsApp + 5 LinkedIn scripts",
      "Context intros, public-activity replies, one-observation openers",
      "Reply-handling and the one-max follow-up rule",
    ],
    count: "10 scripts",
    kind: "script",
  },
  {
    id: "follow-ups",
    index: "03",
    title: "Four-step follow-up system",
    blurb:
      "Initial touch, a useful follow-up at +3 business days, the easy-exit second follow-up, and a close-the-loop goodbye.",
    points: [
      "Exact word-for-word messages for all 4 steps",
      "Standard objection handling — pricing, existing providers, small budgets",
      "Instant, everywhere opt-out discipline",
    ],
    count: "4 steps",
    kind: "email",
  },
  {
    id: "proposals",
    index: "04",
    title: "Four editable proposals",
    blurb:
      "Website, SEO, social media and Shopify proposals that carry ten fixed sections — so scope, revisions and payment milestones stop being the argument.",
    points: [
      "Objectives → scope → deliverables → timeline",
      "Payment milestones, revision limits, assumptions & exclusions",
      "Illustrative INR figures, clearly marked to be replaced",
    ],
    count: "4 proposals",
    kind: "doc",
  },
  {
    id: "tracker",
    index: "05",
    title: "Lead tracker (Excel / Google Sheets)",
    blurb:
      "A 15-column xlsx with status dropdowns, overdue-follow-up flags, conditional formatting and a live dashboard. No scraped data inside — only a marked example row.",
    points: [
      "Status, category, channel and source dropdowns",
      "Overdue follow-up turns red; won turns green",
      "Dashboard: leads, replies, proposals, open pipeline value",
    ],
    count: "1 tracker",
    kind: "tool",
  },
  {
    id: "quickstart",
    index: "06",
    title: "Quick-start guide & worked example",
    blurb:
      "A 7-step first-week route — pick a lane, list 15 businesses, send 5 a day — plus one complete worked example from research to follow-up.",
    points: [
      "Where to find prospects (public sources only)",
      "How to log sends and review replies weekly",
      "A full fictional example, research → yes/no",
    ],
    count: "7 steps",
    kind: "doc",
  },
];

export const FILE_COUNT = 6; // files in the paid zip (see INCLUDED_FILES)
export const HANDBOOK_PAGES = 66;
export const SCRIPT_TOTAL =
  20 // email templates
  + 40 // subject-line options
  + 10 // DM scripts
  + 4; // proposals

export const NICHES = [
  "Web designers",
  "Developers",
  "SEO freelancers",
  "Social media managers",
  "Shopify developers",
  "Marketing agencies",
  "SEO agencies",
  "Content freelancers",
];

export const INCLUDED_FILES = [
  { name: "ClientFlow-Handbook.pdf", desc: "66-page handbook — all six parts" },
  { name: "Email-Templates.docx", desc: "The 20 emails + 10 DMs, editable" },
  { name: "Proposal-Templates.docx", desc: "4 proposals, editable figures" },
  { name: "Lead-Tracker.xlsx", desc: "Dropdowns, flags, dashboard" },
  { name: "Quick-Start-Guide.pdf", desc: "The first week, printed short" },
  { name: "README.md", desc: "What each file is, how to use it" },
];
