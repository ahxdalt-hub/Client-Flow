import { Reveal, Spotlight, Counter } from "../motion";
import { Container, Section, SectionHeading } from "../ui";
import { MODULES, INCLUDED_FILES, SCRIPT_TOTAL, HANDBOOK_PAGES } from "@/lib/product-content";

const kindIcon = {
  email: (
    <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
  ),
  script: <path d="M8 10h8M8 14h5M21 12a9 9 0 1 1-4-7.5L21 3v18l-4-2" />,
  doc: <path d="M6 2h9l5 5v15H6zM14 2v6h6" />,
  tool: <path d="M12 2v4M12 18v4M2 12h4M18 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />,
} as const;

export function Inside() {
  return (
    <Section id="inside" ariaLabel="What is inside the kit">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeading
            eyebrow="What's inside"
            title={
              <>
                Six files, one job:
                <br />
                <span className="text-muted">fill your pipeline.</span>
              </>
            }
            description="Every file is written to be opened, edited and used today. No theory chapters — the templates, scripts, system, proposals and tracker that move a stranger towards a call, a proposal, and a signed deal."
          />
          <Reveal delay={120} className="lg:justify-self-end">
            <div className="flex items-center gap-8 rounded-2xl border border-line bg-paper p-6 lg:p-7">
              <div>
                <p className="display text-[2.6rem] leading-none text-ink">
                  <Counter to={SCRIPT_TOTAL} />
                </p>
                <p className="mt-1.5 text-[0.78rem] font-medium uppercase tracking-wider text-muted">
                  templates, scripts &amp; proposals
                </p>
              </div>
              <div className="h-12 w-px bg-line" />
              <p className="max-w-[13rem] text-[0.85rem] leading-relaxed text-muted">
                Six files — a {HANDBOOK_PAGES}-page handbook plus every editable
                source. Works on your phone, in Word and in Google Sheets.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Modules — asymmetric editorial grid */}
        <div className="mt-14 grid gap-4 md:grid-cols-12">
          {MODULES.map((mod, i) => (
            <Reveal
              key={mod.id}
              delay={Math.min((i % 4) * 80, 240)}
              className={
                i % 4 === 0
                  ? "md:col-span-7"
                  : i % 4 === 1
                    ? "md:col-span-5"
                    : i % 4 === 2
                      ? "md:col-span-5"
                      : "md:col-span-7"
              }
            >
              <Spotlight
                as="article"
                className="card-lift group h-full rounded-[var(--radius-card)] border border-line bg-paper p-6 md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-accent">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {kindIcon[mod.kind]}
                    </svg>
                  </div>
                  <span className="font-display text-[1rem] text-line-strong" aria-hidden>
                    {mod.index}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[1.28rem] font-semibold tracking-[-0.01em] text-ink">
                  {mod.title}
                </h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  {mod.blurb}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {mod.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-[0.82rem] text-muted"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 inline-flex rounded-full bg-ivory px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">
                  {mod.count}
                </p>
              </Spotlight>
            </Reveal>
          ))}
        </div>

        {/* File manifest */}
        <Reveal delay={100} className="mt-10">
          <details className="mx-auto max-w-3xl rounded-[var(--radius-card)] border border-line bg-paper px-6 md:px-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[0.95rem] font-semibold text-ink">
              <span>See the exact file list</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted transition-transform" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <ul className="divide-y divide-line border-t border-line pb-3 text-[0.86rem]">
              {INCLUDED_FILES.map((file) => (
                <li key={file.name} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="font-mono text-[0.78rem] text-ink">{file.name}</span>
                  <span className="text-right text-muted">{file.desc}</span>
                </li>
              ))}
            </ul>
          </details>
        </Reveal>
      </Container>
    </Section>
  );
}
