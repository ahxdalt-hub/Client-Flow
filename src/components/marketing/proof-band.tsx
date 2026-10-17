import { Container } from "../ui";
import { Counter, Reveal } from "../motion";
import { Aurora, Grain } from "../art/ambient";
import { FILE_COUNT, HANDBOOK_PAGES } from "@/lib/product-content";

/**
 * Dark "at a glance" band. Every number is a fact about the kit itself —
 * file count, template count, handbook length — never invented traction.
 */

const STATS: { value: number; suffix?: string; label: string }[] = [
  { value: FILE_COUNT, label: "designed files" },
  { value: 20, label: "cold email templates" },
  { value: 10, label: "WhatsApp & LinkedIn scripts" },
  { value: 4, label: "editable proposals" },
  { value: 4, label: "step follow-up system" },
  { value: HANDBOOK_PAGES, label: "page handbook" },
];

export function ProofBand() {
  return (
    <section
      aria-label="The kit at a glance"
      className="on-ink relative isolate overflow-hidden border-b border-line bg-ink text-ivory"
    >
      <Aurora className="opacity-60" />
      <Grain opacity={0.5} />

      <Container className="relative z-10 py-16 md:py-20">
        <Reveal className="max-w-xl" variant="up">
          <p className="eyebrow !text-ivory/45">The kit at a glance</p>
          <h2 className="display mt-3 text-[clamp(1.6rem,3vw,2.3rem)] text-ivory">
            Everything is already written.
            <br />
            <span className="text-ivory/55">You only add the name.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70} y={14}>
              <div className="border-t border-ivory/12 pt-4">
                <p className="display text-[clamp(2rem,4vw,2.9rem)] leading-none text-ivory">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-[0.78rem] leading-snug text-ivory/55">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
