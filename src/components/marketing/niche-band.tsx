import type { ReactNode } from "react";

import { NICHES } from "@/lib/product-content";

/**
 * Dual ticker band — buyer niches one way, kit contents the other. Decorative.
 *
 * Every item carries a hand-drawn 24×24 line glyph rather than a system emoji:
 * emoji render multicolour and differ per OS family, which fights the warm-clay
 * palette. These are drawn to the same rules as the rest of the site's icons
 * (24 grid, 2.1 stroke, round caps) and inherit the accent colour, so they read
 * as part of the page instead of pasted on top of it.
 */

const ICONS: Record<string, ReactNode> = {
  // ── Niches ────────────────────────────────────────────────
  pen: (
    <>
      <path d="M4 20l1-4L15.5 5.5a2.12 2.12 0 0 1 3 3L8 19l-4 1Z" />
      <path d="m14 7 3 3" />
    </>
  ),
  code: (
    <>
      <path d="m9 6-5 6 5 6" />
      <path d="m15 6 5 6-5 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.7-3.7" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.7 10.6 6.6-4" />
      <path d="m8.7 13.4 6.6 4" />
    </>
  ),
  bag: (
    <>
      <path d="M5 7h14l1.2 13H3.8L5 7Z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="m7 15 4-4 3 3 5-6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12h.01" />
    </>
  ),
  page: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </>
  ),

  // ── Kit contents ──────────────────────────────────────────
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </>
  ),
  chat: (
    <path d="M20 16a2 2 0 0 1-2 2H9l-5 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10Z" />
  ),
  clipboard: (
    <>
      <rect x="9" y="3" width="6" height="4" rx="1.2" />
      <path d="M8 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" />
    </>
  ),
  checklist: (
    <>
      <path d="M4 7h.01" />
      <path d="M4 12h.01" />
      <path d="M4 17h.01" />
      <path d="M9 7h11" />
      <path d="M9 12h11" />
      <path d="M9 17h11" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M9.5 9.5V20" />
    </>
  ),
  book: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9.5 3v18" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8 4-8 4-8-4 8-4Z" />
      <path d="m4 11.5 8 4 8-4" />
      <path d="m4 16 8 4 8-4" />
    </>
  ),

  // Fallback — the same four-point star used as the row separator.
  spark: <path d="M12 3.5 14 10l6.5 2-6.5 2-2 6.5-2-6.5L3.5 12 10 10l2-6.5Z" />,
};

const NICHE_ICON: Record<string, string> = {
  "Web designers": "pen",
  Developers: "code",
  "SEO freelancers": "search",
  "Social media managers": "share",
  "Shopify developers": "bag",
  "Marketing agencies": "chart",
  "SEO agencies": "target",
  "Content freelancers": "page",
};

type Item = { label: string; icon: string };

const NICHE_ITEMS: Item[] = NICHES.map((label) => ({
  label,
  icon: NICHE_ICON[label] ?? "spark",
}));

const CONTENT_ITEMS: Item[] = [
  { label: "20 cold email templates", icon: "mail" },
  { label: "10 DM scripts", icon: "chat" },
  { label: "4 editable proposals", icon: "clipboard" },
  { label: "4-step follow-up system", icon: "checklist" },
  { label: "Lead tracker", icon: "table" },
  { label: "66-page handbook", icon: "book" },
  { label: "Yours to keep", icon: "bag" },
  { label: "Fully editable sources", icon: "layers" },
];

function Glyph({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name] ?? ICONS.spark}
    </svg>
  );
}

function Row({ items, reverse = false }: { items: Item[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  // Each item carries its own trailing gap so the doubled list stays exactly
  // twice the visible run — the -50% translate loops without a seam.
  const itemClass = reverse
    ? "gap-7 pr-7 text-[0.82rem] text-muted"
    : "gap-8 pr-8 text-[0.86rem] text-ink/75";

  const iconClass = reverse ? "text-accent/50" : "text-accent/65";
  const starClass = reverse ? "text-[0.62em] text-accent/45" : "text-[0.6em] text-accent/65";

  return (
    <div className="marquee-track edge-fade-x overflow-hidden">
      <div
        className={[
          "flex w-max items-center",
          reverse
            ? "marquee-inner marquee-inner--reverse"
            : "marquee-inner animate-marquee",
        ].join(" ")}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className={`flex items-center whitespace-nowrap font-medium tracking-[0.01em] ${itemClass}`}
          >
            <span className="flex items-center gap-2">
              <Glyph name={item.icon} className={`h-[1.05em] w-[1.05em] shrink-0 ${iconClass}`} />
              {item.label}
            </span>
            <span aria-hidden="true" className={starClass}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function NicheBand() {
  return (
    <div aria-hidden className="border-b border-line">
      <div className="border-b border-line bg-paper py-5 md:py-7">
        <Row items={NICHE_ITEMS} />
      </div>
      {/* Warm sand separates the two tickers from each other and from the
          dark band that follows, so the strip reads as two calm rails
          instead of one crowded block of type. */}
      <div className="bg-sand/70 py-5 md:py-7">
        <Row items={CONTENT_ITEMS} reverse />
      </div>
    </div>
  );
}
