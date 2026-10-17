import type { CSSProperties, ReactNode } from "react";

import { Container, ButtonLink } from "../ui";
import { Grain } from "../art/ambient";
import { ScrollGallery } from "../scroll-gallery";
import { activePrice } from "@/lib/pricing";
import { PAYMENTS_LIVE } from "@/lib/payments-status";

/**
 * "Look inside" — a pinned, scroll-driven horizontal gallery on a dark stage.
 *
 * Each card previews one real file shipped in the kit. Showing the product
 * is the conversion work here: the visitor stops wondering whether ₹299 buys
 * something substantial. Previews are stylised CSS, not screenshots, and
 * every claim maps to product-content.ts.
 *
 * The section is the one dark band in the page. Ink makes the paper files
 * read as objects, a pool of light walks the stage with the strip (driven by
 * the `--gallery-*` variables <ScrollGallery> writes), and the cards fan into
 * depth around the middle of the window. All of it is decoration: with the
 * stage switched off — small screens, reduced motion, no JS — this is a plain
 * readable strip of files.
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

/**
 * Scenery for the pinned window.
 *
 * Decorative only, and every layer reads the CSS variables <ScrollGallery>
 * writes: the beam slides with the strip, the hairline grid drifts slower
 * than the cards, the manifest runs along the foot, and the ghost numeral is
 * the file you are on. The six numerals cross-fade across the progress scale
 * in pure CSS, so nothing here holds state.
 */
function GalleryStage() {
  const last = FILES.length - 1;

  return (
    <>
      <span className="look-cone" />
      <span className="look-grid" />
      <span className="look-beam" />

      <span className="look-ribbon">
        {[0, 1].map((pass) =>
          FILES.map((item, i) => (
            <span key={`${pass}-${item.file}`} className="look-ribbon-item">
              <span className="look-ribbon-num">{String(i + 1).padStart(2, "0")}</span>
              {item.file}
            </span>
          )),
        )}
      </span>

      {FILES.map((item, i) => (
        <span
          key={item.file}
          className="look-num"
          style={{ "--at": (i / last).toFixed(3) } as CSSProperties}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
      ))}
    </>
  );
}

/** The file's extension, as a chip: ClientFlow-Handbook.pdf → PDF. */
function fileType(file: string) {
  return file.split(".").pop()?.toUpperCase() ?? "FILE";
}

export function LookInside() {
  return (
    <section aria-label="Look inside the kit" className="on-ink relative isolate border-t border-line">
      {/* ── Scenery: ink base, warm glows, ivory ramps at both seams ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="look-base" />
        <span className="look-glow look-glow--a" />
        <span className="look-glow look-glow--b" />
        <span className="look-glow look-glow--c" />
        <span className="look-ramp look-ramp--top" />
        <span className="look-ramp look-ramp--bottom" />
        <Grain opacity={0.22} />
      </div>

      <Container className="relative pt-24 md:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow !text-ivory/45">Look inside</p>
          <h2 className="display mt-3 text-[clamp(1.9rem,4vw,2.9rem)] text-ivory">
            Six files.
            <br />
            <span className="text-ivory/45">Nothing to assemble.</span>
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ivory/60">
            This is what you get the moment you pay — a designed handbook,
            editable templates, four proposals and a working tracker.
            Scroll to walk through every file.
          </p>
        </div>
      </Container>

      <div className="mt-12">
        <ScrollGallery stage={<GalleryStage />}>
          {FILES.map((item) => (
            <article key={item.file} className="w-[20rem] shrink-0 sm:w-[22rem]">
              <div className="gallery-card spotlight flex h-full flex-col rounded-[calc(var(--radius-card)+4px)] border border-line bg-paper p-5">
                <div className="img-frame flex h-[15rem] items-center justify-center bg-sand p-5">
                  {item.visual}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="truncate font-mono text-[0.68rem] text-muted">{item.file}</p>
                  <span className="shrink-0 rounded-full border border-line px-2 py-[0.12rem] text-[0.52rem] font-bold uppercase tracking-[0.12em] text-muted">
                    {fileType(item.file)}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-[1.12rem] font-semibold text-ink">
                  {item.label}
                </h3>
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted">
                  {item.note}
                </p>
              </div>
            </article>
          ))}

          {/* Closing CTA card — the last thing on the strip */}
          <article className="w-[20rem] shrink-0 sm:w-[22rem]">
            <div className="gallery-card gallery-cta relative flex h-full flex-col justify-center overflow-hidden rounded-[calc(var(--radius-card)+4px)] p-7">
              <Grain opacity={0.16} />
              <p className="eyebrow !text-ivory/65">All six, one download</p>
              <p className="display mt-3 text-[1.7rem] leading-tight text-ivory">
                Own the whole system for ₹{activePrice()}.
              </p>
              <p className="mt-3 text-[0.86rem] leading-relaxed text-ivory/75">
                Instant access, free future updates, and a full refund if
                anything on our side goes wrong.
              </p>
              <ButtonLink href="/checkout" variant="primary" size="lg" className="mt-7 w-full">
                Get the kit — ₹{activePrice()}
              </ButtonLink>
              {PAYMENTS_LIVE ? (
                <p className="mt-3 text-center text-[0.72rem] text-ivory/60">
                  UPI &amp; cards · secure via Razorpay
                </p>
              ) : null}
            </div>
          </article>
        </ScrollGallery>
      </div>

      <Container className="relative pb-24 md:pb-28">
        <p className="text-center text-[0.82rem] text-ivory/40">
          Keep scrolling — the gallery moves with you.
        </p>
      </Container>
    </section>
  );
}
