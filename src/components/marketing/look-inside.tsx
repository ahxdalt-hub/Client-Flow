import type { ReactNode } from "react";

import { Container, SectionHeading, ButtonLink } from "../ui";
import { ScrollGallery } from "../scroll-gallery";

/**
 * "Look inside" — a pinned, scroll-driven horizontal gallery.
 *
 * Each card previews one real file shipped in the kit. Showing the product
 * is the conversion work here: the visitor stops wondering whether ₹299 buys
 * something substantial. Previews are stylised CSS, not screenshots, and
 * every claim maps to product-content.ts.
 */

function Sheet({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-lg border border-line bg-paper p-3.5 shadow-[var(--shadow-lift)]">
      {children}
    </div>
  );
}

function HandbookVisual() {
  return (
    <Sheet>
      <div className="flex items-center justify-between border-b border-line pb-2">
        <span className="text-[0.56rem] font-bold uppercase tracking-[0.12em] text-accent">
          Template 04
        </span>
        <span className="text-[0.56rem] text-muted">page 18 / 66</span>
      </div>
      <p className="mt-2.5 text-[0.7rem] font-semibold text-ink">Speed is the offer</p>
      <div className="mt-2 space-y-1.5">
        <span className="block h-1.5 w-full rounded-full bg-line" />
        <span className="block h-1.5 w-5/6 rounded-full bg-line" />
        <span className="block h-1.5 w-4/6 rounded-full bg-line" />
      </div>
      <div className="mt-3 rounded-md bg-accent-tint px-2.5 py-2 text-[0.58rem] leading-snug text-[var(--color-accent-strong)]">
        {"{{one specific observation}}"}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-[0.55rem] text-muted">checklist + worked example</span>
      </div>
    </Sheet>
  );
}

function EmailVisual() {
  const subjects = [
    "A quick fix for {{site}}",
    "Noticed something on your store",
    "Following up — worth ten minutes?",
  ];
  return (
    <Sheet>
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Inbox</p>
      <ul className="mt-2.5 space-y-2">
        {subjects.map((subject, i) => (
          <li key={subject} className="flex items-start gap-2">
            <span className="mt-px grid h-4 w-4 shrink-0 place-items-center rounded bg-ivory text-[0.5rem] font-bold text-muted">
              {i + 1}
            </span>
            <span className="text-[0.64rem] leading-snug text-ink">{subject}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 border-t border-line pt-2 text-[0.56rem] text-muted">
        …plus 17 more, and 10 DM scripts
      </p>
    </Sheet>
  );
}

function ProposalVisual() {
  const sections = ["Objectives", "Scope", "Deliverables", "Timeline", "Milestones", "Revisions"];
  return (
    <Sheet>
      <p className="text-[0.66rem] font-semibold text-ink">Website proposal</p>
      <ul className="mt-2 space-y-1">
        {sections.map((section) => (
          <li
            key={section}
            className="flex items-center justify-between border-b border-dashed border-line pb-1 text-[0.6rem] text-muted last:border-0"
          >
            <span>{section}</span>
            <span className="text-accent">✓</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.56rem] text-muted">Illustrative INR figures, marked to replace</p>
    </Sheet>
  );
}

function TrackerVisual() {
  const rows = [
    ["Sharma Interiors", "Sent", "Due", "₹45k"],
    ["Kapoor Dental", "Replied", "Today", "₹60k"],
    ["Nair Textiles", "Proposal", "Won", "₹1.2L"],
  ];
  return (
    <Sheet>
      <div className="grid grid-cols-4 gap-1 border-b border-line pb-1.5 text-[0.5rem] font-bold uppercase tracking-wide text-muted">
        <span>Lead</span>
        <span>Status</span>
        <span>Follow-up</span>
        <span className="text-right">Value</span>
      </div>
      <ul className="mt-1.5 space-y-1">
        {rows.map((row, i) => (
          <li key={row[0]} className="grid grid-cols-4 gap-1 text-[0.55rem]">
            <span className="truncate text-ink">{row[0]}</span>
            <span className={i === 1 ? "text-accent" : "text-muted"}>{row[1]}</span>
            <span className={i === 0 ? "text-[#b3261e]" : i === 2 ? "text-[#2f6b3f]" : "text-muted"}>
              {row[2]}
            </span>
            <span className="text-right tabular-nums text-muted">{row[3]}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-end gap-1.5 border-t border-line pt-2">
        <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
          {[6, 10, 14, 18].map((h) => (
            <span key={h} className="w-[4px] rounded-sm bg-accent" style={{ height: h }} />
          ))}
        </div>
        <span className="text-[0.5rem] text-muted">live dashboard</span>
      </div>
    </Sheet>
  );
}

function QuickStartVisual() {
  const steps = ["Pick one niche", "List 15 businesses", "Send 5 a day", "Log replies", "Follow up +3d", "Propose", "Review weekly"];
  return (
    <Sheet>
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Week one</p>
      <ol className="mt-2 space-y-1.5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-[0.58rem] text-muted">
            <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-ink text-[0.42rem] font-bold text-ivory">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </Sheet>
  );
}

function ReadmeVisual() {
  return (
    <Sheet>
      <pre className="whitespace-pre-wrap font-mono text-[0.56rem] leading-relaxed text-muted">{`# ClientFlow Outreach Kit

1. Read this first
2. Open the handbook
3. Edit Email-Templates.docx
4. Log leads in the tracker`}</pre>
    </Sheet>
  );
}

const FILES: { file: string; label: string; note: string; visual: ReactNode }[] = [
  { file: "ClientFlow-Handbook.pdf", label: "The handbook", note: "20 templates, each with a checklist and a filled example.", visual: <HandbookVisual /> },
  { file: "Email-Templates.docx", label: "Email & DM templates", note: "Every template editable — adapt before you send.", visual: <EmailVisual /> },
  { file: "Proposal-Templates.docx", label: "Four proposals", note: "Website, SEO, social and Shopify, ten sections each.", visual: <ProposalVisual /> },
  { file: "Lead-Tracker.xlsx", label: "The lead tracker", note: "Status dropdowns, overdue flags, live dashboard.", visual: <TrackerVisual /> },
  { file: "Quick-Start-Guide.pdf", label: "Quick start", note: "The first week, printed short and in order.", visual: <QuickStartVisual /> },
  { file: "README.md", label: "Read me first", note: "What each file is and how to use it today.", visual: <ReadmeVisual /> },
];

export function LookInside() {
  return (
    <section
      aria-label="Look inside the kit"
      className="relative isolate border-t border-line bg-sand"
    >
      <Container className="pt-20 md:pt-28">
        <SectionHeading
          align="center"
          eyebrow="Look inside"
          title={
            <>
              Six files.
              <br />
              <span className="text-muted">Nothing to assemble.</span>
            </>
          }
          description="This is what lands in your inbox the moment you pay — a designed handbook, editable templates, four proposals and a working tracker. Scroll to walk through every file."
        />
      </Container>

      <div className="mt-14">
        <ScrollGallery>
          {FILES.map((item) => (
            <article key={item.file} className="w-[19rem] shrink-0 sm:w-[21rem]">
              <div className="spotlight card-lift flex h-full flex-col rounded-[calc(var(--radius-card)+4px)] border border-line bg-paper p-5 shadow-[var(--shadow-lift)]">
                <div className="img-frame flex h-[15rem] items-center justify-center bg-sand p-5">
                  {item.visual}
                </div>
                <p className="mt-5 font-mono text-[0.7rem] text-muted">{item.file}</p>
                <h3 className="mt-1.5 font-display text-[1.12rem] font-semibold text-ink">
                  {item.label}
                </h3>
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted">
                  {item.note}
                </p>
              </div>
            </article>
          ))}

          {/* Closing CTA card */}
          <article className="w-[19rem] shrink-0 sm:w-[21rem]">
            <div className="flex h-full flex-col justify-center rounded-[calc(var(--radius-card)+4px)] border border-ink/10 bg-ink p-7 text-ivory">
              <p className="eyebrow !text-ivory/45">All six, one download</p>
              <p className="display mt-3 text-[1.7rem] leading-tight text-ivory">
                Own the whole system for ₹299.
              </p>
              <p className="mt-3 text-[0.86rem] leading-relaxed text-ivory/60">
                Instant access, free future updates, and a 10-day refund
                promise if it doesn&apos;t sharpen your outreach.
              </p>
              <ButtonLink href="/checkout" variant="accent" size="lg" className="mt-7 w-full">
                Get the kit — ₹299
              </ButtonLink>
              <p className="mt-3 text-center text-[0.72rem] text-ivory/45">
                UPI &amp; cards · secure via Razorpay
              </p>
            </div>
          </article>
        </ScrollGallery>
      </div>

      <Container className="pb-20 md:pb-24">
        <p className="text-center text-[0.82rem] text-muted">
          Keep scrolling — the gallery moves with you.
        </p>
      </Container>
    </section>
  );
}
