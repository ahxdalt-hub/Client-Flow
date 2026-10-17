import Image from "next/image";

import { Reveal } from "../motion";
import { Container, Section, SectionHeading } from "../ui";
import { Grain } from "../art/ambient";

const STEPS = [
  {
    n: "1",
    title: "Open the handbook, pick your lane",
    text: "The Quick-Start Guide takes ten minutes: one problem you solve, for one kind of business. Everything else follows from that.",
  },
  {
    n: "2",
    title: "Personalise one line, send ten",
    text: "Each template has one slot for a specific observation. The scripts are short on purpose — replies come from relevance, not length.",
  },
  {
    n: "3",
    title: "Follow up on schedule, not on doubt",
    text: "The four-step system tells you exactly when to nudge and what to say, and the tracker flags which leads are overdue.",
  },
];

/**
 * The instruction panel.
 *
 * Three steps, written straight onto a photograph of the desk they happen
 * at. The picture is veiled to ink so the copy keeps its contrast, and two
 * slow loops keep the band from sitting completely still: a warm glow
 * drifting behind the words and a light sheen crossing the panel.
 */
export function HowItWorks() {
  return (
    <Section ariaLabel="How it works" className="border-t border-line bg-paper">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          align="center"
          title="From download to first send, in one sitting."
        />

        <Reveal delay={120} y={24} className="mt-14">
          <div className="steps-panel on-ink">
            <Image
              src="/images/desk-dark.jpg"
              alt=""
              fill
              sizes="(min-width: 1240px) 1240px, 100vw"
              className="object-cover object-center opacity-60"
            />
            <span className="steps-scrim" />
            <span className="steps-glow steps-glow--a" />
            <span className="steps-glow steps-glow--b" />
            <Grain opacity={0.3} />

            <ol className="steps-track">
              {STEPS.map((step, i) => (
                <Reveal
                  key={step.n}
                  as="li"
                  delay={140 + i * 130}
                  y={20}
                  className="steps-item list-none"
                >
                  <span className="steps-num" aria-hidden="true">
                    {step.n}
                  </span>
                  <h3 className="mt-5 max-w-[17rem] font-display text-[1.18rem] font-semibold leading-snug text-ivory">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-ivory/65">
                    {step.text}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
