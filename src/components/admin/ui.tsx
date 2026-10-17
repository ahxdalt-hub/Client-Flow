import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Presentational pieces for the owner admin panel. Server-safe (no hooks), so
 * they can be rendered from any admin route.
 */

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-line bg-paper ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-[clamp(1.6rem,3vw,2.2rem)] text-ink">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-[0.88rem] text-muted">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "paid"
      ? "bg-accent-tint text-accent"
      : status === "created"
        ? "bg-amber-100 text-amber-700"
        : status === "failed"
          ? "bg-red-50 text-red-700"
          : "bg-ivory text-muted";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${tone}`}>
      {status}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="display text-[1.7rem] leading-none text-ink">{value}</p>
      <p className="mt-2 text-[0.72rem] uppercase tracking-wider text-muted">{label}</p>
      {hint ? <p className="mt-1 text-[0.7rem] text-muted/80">{hint}</p> : null}
    </Card>
  );
}

export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-line/60 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Human "3 min ago" style timestamps for activity feeds. */
export function relTime(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const min = Math.round((Date.now() - t) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} d ago`;
}

/** Minimal dependency-free bar chart. Values are pre-scaled to the max. */
export function BarChart({
  data,
  emptyLabel = "No data yet",
}: {
  data: { label: string; value: number; title?: string }[];
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const hasAny = data.some((d) => d.value > 0);
  return (
    <div>
      <div className="flex h-32 items-end gap-1.5">
        {data.map((d) => (
          <div
            key={d.label}
            className="group flex h-full flex-1 items-end"
            title={d.title ?? `${d.label}: ${d.value}`}
          >
            <div
              className={`w-full rounded-t transition-colors ${
                d.value > 0 ? "bg-accent/65 group-hover:bg-accent" : "bg-line/60"
              }`}
              style={{ height: `${Math.max(3, (d.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.68rem] text-muted">
        <span>{data[0]?.label}</span>
        {!hasAny ? <span>{emptyLabel}</span> : null}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-[0.85rem] text-muted">{children}</p>;
}

export const inr = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const formatIst = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso))
    : "—";

export const shortId = (id: string | null) =>
  id ? `${id.slice(0, 8)}…${id.slice(-4)}` : "—";

/** "2026-10-17" → "17/10" for chart axes. */
export const dayLabel = (date: string) => {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
};

/** Prev/next pager that preserves the current filters. */
export function Pager({
  basePath,
  query,
  page,
  pages,
}: {
  basePath: string;
  query: Record<string, string | undefined>;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[0.82rem] text-muted">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            prefetch={false}
            className="rounded-lg border border-line px-3 py-1.5 font-semibold text-ink hover:bg-paper"
          >
            Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link
            href={href(page + 1)}
            prefetch={false}
            className="rounded-lg border border-line px-3 py-1.5 font-semibold text-ink hover:bg-paper"
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
