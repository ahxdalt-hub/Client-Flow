import { NICHES } from "@/lib/product-content";

/** Dual ticker band — buyer niches one way, kit contents the other. Decorative. */

const CONTENTS = [
  "20 cold email templates",
  "10 DM scripts",
  "4 editable proposals",
  "4-step follow-up system",
  "Lead tracker",
  "66-page handbook",
  "Free updates forever",
  "Fully editable sources",
];

function Row({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-track edge-fade-x overflow-hidden">
      <div
        className={
          reverse
            ? "marquee-inner marquee-inner--reverse flex w-max items-center gap-10 pr-10"
            : "marquee-inner flex w-max animate-marquee items-center gap-10 pr-10"
        }
      >
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={
              reverse
                ? "flex items-center gap-10 whitespace-nowrap text-[0.76rem] font-medium tracking-wide text-muted/80"
                : "flex items-center gap-10 whitespace-nowrap text-[0.82rem] font-medium tracking-wide text-muted"
            }
          >
            {item}
            <span className="text-accent/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function NicheBand() {
  return (
    <div aria-hidden className="border-b border-line bg-paper">
      <div className="py-4">
        <Row items={NICHES} />
      </div>
      <div className="border-t border-line py-3.5">
        <Row items={CONTENTS} reverse />
      </div>
    </div>
  );
}
