import { Reveal, Spotlight } from "../motion";
import { Container, Section, SectionHeading } from "../ui";

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

export function HowItWorks() {
  return (
    <Section ariaLabel="How it works" className="border-t border-line bg-paper">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          align="center"
          title="From download to first send, in one sitting."
        />
        <ol className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 130} y={22}>
              <Spotlight
                as="li"
                className="card-lift relative h-full list-none rounded-[var(--radius-card)] border border-line bg-ivory p-6"
              >
                <span className="display absolute right-5 top-4 text-[2.4rem] leading-none text-line-strong">
                  {step.n}
                </span>
                <h3 className="mt-2 max-w-[15rem] font-display text-[1.15rem] font-semibold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-muted">
                  {step.text}
                </p>
              </Spotlight>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
