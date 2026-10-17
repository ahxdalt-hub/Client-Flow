import { cn } from "@/lib/cn";

/**
 * Editorial "product mockup" composed purely with HTML/CSS —
 * a floating document card with restrained depth. Decorative:
 * marked aria-hidden and duplicated in text elsewhere.
 */
export function ProductMockup({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      {/* back card */}
      <div
        className="float-slow absolute inset-x-6 -top-5 rounded-2xl border border-line bg-paper p-5 opacity-80"
        style={{ animationDelay: "-2.5s", transform: "rotate(1.4deg)" }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent/70" />
          <div className="h-2 w-24 rounded-full bg-line" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-line/80" />
          <div className="h-2 w-4/5 rounded-full bg-line/80" />
          <div className="h-2 w-3/5 rounded-full bg-line/80" />
        </div>
      </div>

      {/* front card — the "template doc" */}
      <div
        className="float-slow relative rounded-2xl border border-line bg-paper p-6 shadow-[var(--shadow-float)]"
        style={{ "--tilt": "-1deg" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-ivory">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
            <div>
              <p className="text-[0.78rem] font-semibold leading-none">cold-email-04</p>
              <p className="mt-1 text-[0.66rem] leading-none text-muted">web design lead</p>
            </div>
          </div>
          <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-accent">
            Copy me
          </span>
        </div>

        <div className="pt-4 text-[0.8rem] leading-relaxed">
          <p className="font-semibold text-ink">Subject: your site, one fix that pays for itself</p>
          <p className="mt-3 grid gap-1.5 text-muted">
            <span className="block text-[0.95rem] leading-snug font-medium text-ink/90">
              Hi {`{{name}}`} — noticed one thing on your site…
            </span>
            <span className="block bg-ivory rounded-md px-3 py-2">{`{{personalised first line}}`}</span>
            <span className="block bg-accent-tint rounded-md px-3 py-2 text-[var(--color-accent-strong)]">{`{{specific value observation}}`}</span>
            <span className="block bg-ivory rounded-md px-3 py-2">Worth 15 minutes to compare notes?</span>
          </p>
        </div>

        {/* response bar */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-ivory px-3.5 py-2.5">
          <span className="pulse-dot h-2 w-2 rounded-full bg-accent" />
          <p className="text-[0.72rem] text-muted">
            Reply received · booking a call
          </p>
        </div>
      </div>

      {/* mini stat card */}
      <div
        className="float-slow absolute -right-3 -bottom-6 flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3 text-ivory shadow-[var(--shadow-float)]"
        style={{ animationDelay: "-4.5s" }}
      >
        <div className="flex h-8 items-end gap-[3px]" aria-hidden="true">
          {[5, 8, 11, 14].map((h, i) => (
            <span
              key={h}
              className="w-[4px] origin-bottom rounded-sm bg-accent"
              style={{ height: h, animation: `bar-rise .8s ${1.2 + i * 0.15}s var(--ease-out-expo) both` }}
            />
          ))}
        </div>
        <div className="text-[0.68rem] leading-tight">
          <p className="font-bold">Sequences</p>
          <p className="text-ivory/60">follow-up 3 of 5</p>
        </div>
      </div>
    </div>
  );
}
