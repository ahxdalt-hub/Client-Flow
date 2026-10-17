import { Container, Section, SectionHeading } from "../ui";
import { Reveal } from "../motion";
import { Pipeline } from "../art/pipeline";
import { PhotoBackdrop } from "../art/photo-backdrop";
import { FlowRibbon } from "../art/ambient";

/**
 * The five-stage route from cold prospect to signed deal.
 *
 * The photograph is the desk the sequence gets written on — a notebook,
 * a pen, and the niche list — veiled into the ivory so the type stays
 * crisp, then the drawing sits on its own sheet above it. The rail fills
 * with the scroll (see <Pipeline>), so the section is never a still.
 */
export function PipelineSection() {
  return (
    <Section
      ariaLabel="The outreach sequence"
      id="sequence"
      className="relative isolate overflow-hidden"
    >
      <PhotoBackdrop
        src="/images/notes-desk.jpg"
        sizes="100vw"
        speed={52}
        objectPosition="center 44%"
        scrim={
          <>
            <span className="photo-scrim" />
            <span className="photo-cast" />
          </>
        }
      />

      <FlowRibbon className="pointer-events-none absolute inset-x-0 top-16 z-0 h-40 w-full opacity-40" />

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

        <div className="pipeline-panel mt-16">
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
