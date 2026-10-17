import Link from "next/link";
import { connection } from "next/server";

import { Counter } from "@/components/motion";
import {
  BarChart,
  Card,
  Empty,
  ProgressBar,
  Stat,
  dayLabel,
  inr,
  relTime,
} from "@/components/admin/ui";
import {
  getEventStats,
  getRevenueSeries,
  getSystemStatus,
  listCustomers,
} from "@/lib/admin-data";
import { FUNNEL_EVENTS, getStoreOverview } from "@/lib/orders";

const ADMIN_NAME = process.env.ADMIN_NAME ?? "Ahxd";
const SALES_TARGET = 50;
const REVENUE_TARGET_PAISE = 25_000 * 100;

const DOT: Record<string, string> = {
  paid: "bg-accent",
  download: "bg-ink",
  failed: "bg-red-500",
  created: "bg-amber-500",
};

function greeting(): string {
  const h = new Date(Date.now() + 5.5 * 3600_000).getUTCHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminOverviewPage() {
  await connection();

  const [data, revenue, events, status, customers] = await Promise.all([
    getStoreOverview(),
    getRevenueSeries(14),
    getEventStats(14),
    getSystemStatus(),
    listCustomers(),
  ]);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="display text-[clamp(1.9rem,3.6vw,2.7rem)] text-ink">
          {greeting()}, {ADMIN_NAME}.
        </h1>
        <Card className="p-5 text-[0.9rem] text-muted">
          Supabase is not configured — set{" "}
          <span className="font-mono text-ink">SUPABASE_URL</span> and{" "}
          <span className="font-mono text-ink">SUPABASE_SERVICE_ROLE_KEY</span>.
        </Card>
      </div>
    );
  }

  const todayPaise = revenue.at(-1)?.paise ?? 0;
  let streak = 0;
  for (let i = revenue.length - 1; i >= 0; i--) {
    if (revenue[i].paise > 0) streak += 1;
    else break;
  }

  const customerCount = customers?.length ?? 0;
  const statusFails = status.filter((s) => s.level === "fail").length;
  const statusWarns = status.filter((s) => s.level === "warn").length;
  const salesProgress = data.paidCount / SALES_TARGET;
  const revenueProgress = data.revenuePaise / REVENUE_TARGET_PAISE;
  const remaining = Math.max(0, SALES_TARGET - data.paidCount);

  const milestones = [
    { label: "First sale", done: data.paidCount >= 1 },
    { label: "10 sales", done: data.paidCount >= 10 },
    { label: "50 sales", done: data.paidCount >= 50 },
    { label: "₹5k revenue", done: data.revenuePaise >= 5_000 * 100 },
    { label: "₹25k revenue", done: data.revenuePaise >= 25_000 * 100 },
  ];

  const encouragement =
    data.paidCount === 0
      ? "No sales yet — your first one is one good outreach email away. The free sample is doing the selling."
      : data.paidToday > 0
        ? `${data.paidToday} sale${data.paidToday === 1 ? "" : "s"} today. Keep the streak alive.`
        : streak > 0
          ? `${streak}-day sales streak going. One more today keeps it alive.`
          : `${data.paidCount.toLocaleString("en-IN")} sales so far. Send the next batch.`;

  const chart = revenue.map((d) => ({
    label: dayLabel(d.date),
    value: d.paise,
    title: `${d.date}: ${inr(d.paise)}`,
  }));

  const activity = [
    ...data.recentOrders.slice(0, 15).map((o) => ({
      at: o.paid_at ?? o.created_at,
      kind: o.status,
      text:
        o.status === "paid"
          ? `Sale — ${o.customer_name || o.customer_email || "a buyer"} bought the kit`
          : o.status === "failed"
            ? "Payment failed / refunded"
            : `${o.customer_name || o.customer_email || "Someone"} started checkout`,
      href: `/admin/orders/${o.provider_order_id ?? o.id}`,
    })),
    ...data.recentDownloads.slice(0, 15).map((d) => ({
      at: d.created_at,
      kind: "download",
      text: "Kit downloaded",
      href: d.order_id ? `/admin/orders/${d.order_id}` : "/admin/downloads",
    })),
  ]
    .filter((a): a is typeof a & { at: string } => Boolean(a.at))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 10);

  return (
    <div className="space-y-10">
      {/* ── Header: personalised greeting + live system pill ── */}
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow">ClientFlow · Owner console</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.6vw,2.7rem)] text-ink">
            {greeting()}, {ADMIN_NAME}.
          </h1>
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted">
            {encouragement}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold ${
              statusFails
                ? "bg-red-50 text-red-700"
                : statusWarns
                  ? "bg-amber-100 text-amber-700"
                  : "bg-accent-tint text-accent"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                statusFails
                  ? "bg-red-500"
                  : statusWarns
                    ? "bg-amber-500"
                    : "bg-accent"
              }`}
            />
            {statusFails
              ? `${statusFails} issue${statusFails === 1 ? "" : "s"}`
              : statusWarns
                ? "Running · minor warnings"
                : "All systems go"}
          </span>
          <Link
            href="/admin/status"
            prefetch={false}
            className="text-[0.78rem] text-muted underline underline-offset-2 hover:text-ink"
          >
            System status
          </Link>
        </div>
      </header>

      {/* ── Animated KPIs ── */}
      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Paid orders" value={<Counter to={data.paidCount} />} />
        <Stat
          label="Revenue"
          value={<Counter to={Math.round(data.revenuePaise / 100)} prefix="₹" />}
        />
        <Stat label="Customers" value={<Counter to={customerCount} />} hint="unique emails" />
        <Stat
          label="Downloads"
          value={data.downloadsAvailable ? <Counter to={data.downloadCount} /> : "—"}
        />
        <Stat label="Today (IST)" value={<Counter to={data.paidToday} />} />
        <Stat label="Last 7 days" value={<Counter to={data.paid7d} />} />
        <Stat
          label="Today's revenue"
          value={<Counter to={Math.round(todayPaise / 100)} prefix="₹" />}
        />
        <Stat
          label="Unpaid checkouts"
          value={<Counter to={data.createdCount} />}
          hint="started, not paid"
        />
      </section>

      {/* ── Revenue chart + launch goal ── */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <p className="eyebrow">Revenue · last 14 days (IST)</p>
          <div className="mt-4">
            <BarChart data={chart} emptyLabel="No sales yet — the chart fills in on your first one" />
          </div>
        </Card>
        <Card className="p-5">
          <p className="eyebrow">Launch goal</p>
          <p className="mt-3 text-[1.5rem] leading-none text-ink">
            {data.paidCount}{" "}
            <span className="text-[0.9rem] font-normal text-muted">/ {SALES_TARGET} sales</span>
          </p>
          <ProgressBar value={salesProgress} className="mt-3" />
          <p className="mt-2 text-[0.8rem] text-muted">
            {remaining > 0 ? `${remaining} to go` : "Goal reached 🎉"} ·{" "}
            {Math.round(salesProgress * 100)}%
          </p>
          <p className="eyebrow mt-6">Revenue goal</p>
          <ProgressBar value={revenueProgress} className="mt-3" />
          <p className="mt-2 text-[0.8rem] text-muted">
            {inr(data.revenuePaise)} of {inr(REVENUE_TARGET_PAISE)}
          </p>
        </Card>
      </section>

      {/* ── Milestones ── */}
      <Card className="p-5">
        <p className="eyebrow">Milestones</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {milestones.map((m) => (
            <li
              key={m.label}
              className={`rounded-full px-3 py-1.5 text-[0.78rem] font-semibold ${
                m.done ? "bg-accent-tint text-accent" : "border border-line text-muted"
              }`}
            >
              {m.done ? "★ " : "○ "}
              {m.label}
            </li>
          ))}
        </ul>
      </Card>

      {/* ── Activity feed + funnel ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <p className="eyebrow">Recent activity</p>
            <Link
              href="/admin/orders"
              prefetch={false}
              className="text-[0.78rem] text-muted underline underline-offset-2 hover:text-ink"
            >
              All orders
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {activity.length === 0 ? (
              <li>
                <Empty>Quiet in here — activity lands here as buyers arrive.</Empty>
              </li>
            ) : (
              activity.map((a, i) => (
                <li key={`${a.href}-${i}`}>
                  <Link
                    href={a.href}
                    prefetch={false}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ivory"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${DOT[a.kind] ?? "bg-ink/40"}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-[0.85rem] text-ink">
                      {a.text}
                    </span>
                    <span className="shrink-0 text-[0.75rem] text-muted">{relTime(a.at)}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card className="p-5">
          <p className="eyebrow">Funnel · all time</p>
          {!events.available ? (
            <p className="mt-4 text-[0.85rem] text-muted">
              Not available — run <span className="font-mono">supabase/schema.sql</span>.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {FUNNEL_EVENTS.map((event) => (
                <li
                  key={event}
                  className="flex items-center justify-between py-2.5 text-[0.85rem]"
                >
                  <span className="font-mono text-[0.78rem] text-muted">{event}</span>
                  <span className="tabular-nums text-ink">
                    {(events.counts[event] ?? 0).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
