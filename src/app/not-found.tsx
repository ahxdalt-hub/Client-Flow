import { Container, ButtonLink } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { Aurora, GridField } from "@/components/art/ambient";

export default function NotFound() {
  return (
    <div className="relative isolate overflow-hidden">
      <GridField className="z-0 opacity-50" />
      <Aurora className="z-0" />

      <Container className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-xl text-center">
          <Reveal variant="fade">
            <p className="eyebrow">Error 404</p>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h1 className="display mt-3 text-[clamp(2rem,4.5vw,3rem)] text-ink">
              Nothing at this address.
            </h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
              The page you had in mind may have moved — or never existed. Here
              are two routes that always work.
            </p>
          </Reveal>

          <Reveal
            variant="up"
            delay={160}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <ButtonLink href="/" variant="primary" size="lg">
              Back home
            </ButtonLink>
            <ButtonLink href="/sample" variant="ghost" size="lg">
              Get the free sample
            </ButtonLink>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
