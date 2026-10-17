"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Grain } from "../art/ambient";
import { Counter, Parallax, Reveal, Spotlight } from "../motion";
import { Container, Section } from "../ui";
import {
  HANDBOOK_PAGES,
  INCLUDED_FILES,
  MODULES,
  SCRIPT_TOTAL,
} from "@/lib/product-content";

/**
 * "Six files, one job" — the artwork is the section's backdrop.
 *
 * The art sits in a sticky viewport-height window, so it holds still while
 * the six file cards scroll over it, and it drifts with the scroll on the way
 * in. Each card lights its step label, its tick in the rail and its accent
 * hairline as it takes the middle of the screen. No scroll-jacking: with the
 * rail hidden this is an ordinary two-column list.
 */

const kindIcon = {
  email: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  script: <path d="M8 10h8M8 14h5M21 12a9 9 0 1 1-4-7.5L21 3v18l-4-2" />,
  doc: <path d="M6 2h9l5 5v15H6zM14 2v6h6" />,
  tool: <path d="M12 2v4M12 18v4M2 12h4M18 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />,
} as const;

/** "Handbook — 20 cold email templates" → "Handbook" */
function shortLabel(title: string) {
  return title.split("—")[0].trim();
}

export function Inside() {
  const [active, setActive] = useState(0);
  const slots = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = slots.current.indexOf(entry.target as HTMLDivElement);
          if (index >= 0) setActive(index);
        }
      },
      // A narrow band across the middle of the viewport: whichever card
      // crosses it owns the label, so the state never flickers between
      // neighbours.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const slot of slots.current) if (slot) observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  const step = MODULES[active];

  return (
    <Section
      id="inside"
      ariaLabel="What is inside the kit"
      className="relative isolate border-t border-line"
    >
      {/* ── Backdrop: the cover art, pinned behind the files ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          <Parallax speed={48} className="absolute inset-[-12%]">
            <div className="slow-zoom absolute inset-0">
              <Image
                src="/images/flow-art.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Parallax>
          {/* Washed into the ivory — most opaque at the left, where the copy
              sits, lifting to the right so the artwork keeps its colour. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,250,247,0.72)_0%,rgba(251,250,247,0.44)_30%,rgba(251,250,247,0.5)_72%,rgba(251,250,247,0.84)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,250,247,0.72)_0%,rgba(251,250,247,0.34)_46%,rgba(251,250,247,0.08)_100%)]" />
          <Grain opacity={0.18} />
        </div>
      </div>

      <Container className="relative z-10">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-12">
          {/* ── Intro, pinned while the files scroll past ── */}
          <Reveal variant="up" y={18} className="lg:sticky lg:top-[5.5rem]">
            <div>
              <p className="eyebrow">What&apos;s inside</p>
              <h2 className="display mt-3 text-[clamp(1.9rem,4vw,2.9rem)] text-ink">
                Six files, one job:
                <br />
                <span className="text-muted">fill your pipeline.</span>
              </h2>
              <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted">
                Every file is written to be opened, edited and used today. No
                theory chapters — the templates, scripts, system, proposals and
                tracker that move a stranger towards a call, a proposal, and a
                signed deal.
              </p>

              <div className="mt-7 flex items-center gap-7 rounded-2xl border border-line bg-paper/85 p-5 backdrop-blur-md lg:p-6">
                <div>
                  <p className="display text-[2.4rem] leading-none text-ink">
                    <Counter to={SCRIPT_TOTAL} />
                  </p>
                  <p className="mt-1.5 text-[0.72rem] font-medium uppercase tracking-wider text-muted">
                    templates, scripts &amp; proposals
                  </p>
                </div>
                <div className="h-12 w-px bg-line" />
                <p className="max-w-[12rem] text-[0.82rem] leading-relaxed text-muted">
                  Six files — a {HANDBOOK_PAGES}-page handbook plus every
                  editable source.
                </p>
              </div>

              {/* Live position in the list */}
              <div className="mt-4 rounded-2xl border border-line bg-paper/85 p-5 backdrop-blur-md">
                <div key={step.id} className="inside-step">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    File {step.index} / 06
                  </p>
                  <p className="mt-1.5 font-display text-[1.12rem] font-semibold leading-snug text-ink">
                    {shortLabel(step.title)}
                  </p>
                  <p className="mt-1 text-[0.8rem] text-muted">{step.count}</p>
                </div>
                <div className="mt-3.5 flex items-center gap-1.5" aria-hidden="true">
                  {MODULES.map((mod, i) => (
                    <span
                      key={mod.id}
                      className="inside-tick"
                      data-state={i === active ? "active" : i < active ? "passed" : "idle"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── The six files ── */}
          <div className="grid gap-4">
            {MODULES.map((mod, i) => (
              <Reveal key={mod.id} variant="up" y={20} delay={Math.min(i * 70, 210)}>
                <div
                  ref={(el) => {
                    slots.current[i] = el;
                  }}
                  data-active={i === active}
                  className="module-slot h-full"
                >
                  <Spotlight
                    as="article"
                    className="module-card card-lift flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-paper/85 p-6 backdrop-blur-sm md:p-7"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-tint text-accent">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          {kindIcon[mod.kind]}
                        </svg>
                      </span>
                      <span className="font-display text-[1.05rem] text-line-strong" aria-hidden>
                        {mod.index}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-[1.3rem] font-semibold tracking-[-0.01em] text-ink">
                      {mod.title}
                    </h3>
                    <p className="mt-2 max-w-[46rem] text-[0.92rem] leading-relaxed text-muted">
                      {mod.blurb}
                    </p>

                    <ul className="mt-4 space-y-1.5">
                      {mod.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-[0.84rem] text-muted">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-5 inline-flex self-start rounded-full bg-ivory px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">
                      {mod.count}
                    </p>
                  </Spotlight>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* File manifest */}
        <Reveal delay={100} className="mt-10">
          <details className="mx-auto max-w-3xl rounded-[var(--radius-card)] border border-line bg-paper/85 px-6 backdrop-blur-md md:px-8">
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
