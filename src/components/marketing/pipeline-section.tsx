import { Container, Section, SectionHeading } from "../ui";
import { Reveal } from "../motion";
import { Pipeline } from "../art/pipeline";
import { FlowRibbon } from "../art/ambient";

/**
 * The five-stage route from cold prospect to signed deal. The visual is the
 * point of this section, so the copy stays short.
 */
export function PipelineSection() {
  return (
    <Section ariaLabel="The outreach sequence" id="sequence" className="relative overflow-hidden border-t border-line">
      <FlowRibbon className="pointer-events-none absolute inset-x-0 top-16 z-0 h-40 w-full opacity-50" />

      <Container className="relative z-10">
        <SectionHeading
          align="center"
          eyebrow="The route"
          title={
            <>
              One sequence,
              <br />
              <span className="text-accent">five stages.</span>
            </>
          }
          description="The kit is organised around the only job that matters: taking a stranger from “who are you?” to a signed scope — without guessing what to say at any step."
        />

        <div className="mt-16">
          <Pipeline />
        </div>

        <Reveal delay={200} className="mt-14">
          <p className="mx-auto max-w-xl text-center text-[0.9rem] leading-relaxed text-muted">
            Most outreach dies at stage three. The four-step follow-up system
            exists so it doesn&apos;t — with the exact words for the nudge, the
            easy exit, and the goodbye that keeps the door open.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
