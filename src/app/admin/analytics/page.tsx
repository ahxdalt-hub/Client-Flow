import {
  BarChart,
  Card,
  PageHeading,
  dayLabel,
  inr,
} from "@/components/admin/ui";
import { getEventStats, getRevenueSeries } from "@/lib/admin-data";
import { FUNNEL_EVENTS } from "@/lib/orders";
import { connection } from "next/server";

export const instant = false;

export default async function AdminAnalyticsPage() {
  await connection();
  const [events, revenue] = await Promise.all([getEventStats(14), getRevenueSeries(14)]);

  const eventChart = events.daily.map((d) => ({
    label: dayLabel(d.date),
    value: d.count,
    title: `${d.date}: ${d.count} events`,
  }));
  const revenueChart = revenue.map((d) => ({
    label: dayLabel(d.date),
    value: d.paise,
    title: `${d.date}: ${inr(d.paise)}`,
  }));

  return (
    <div className="space-y-10">
      <PageHeading
        title="Analytics"
        subtitle="First-party events only — no third-party trackers, no ad-tech."
      />

      {!events.available ? (
        <Card className="p-5 text-[0.9rem] text-muted">
          Not available — run <span className="font-mono">supabase/schema.sql</span> to
          create <span className="font-mono">analytics_events</span>.
        </Card>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <p className="eyebrow">Events · last 14 days (IST)</p>
              <div className="mt-4">
                <BarChart data={eventChart} emptyLabel="No events recorded yet" />
              </div>
              <p className="mt-3 text-[0.8rem] text-muted">
                {events.total.toLocaleString("en-IN")} events in the window.
              </p>
            </Card>
            <Card className="p-5">
              <p className="eyebrow">Revenue · last 14 days (IST)</p>
              <div className="mt-4">
                <BarChart data={revenueChart} emptyLabel="No sales yet" />
              </div>
            </Card>
          </section>

          <section>
            <h2 className="display text-[1.2rem] text-ink">Event totals</h2>
            <Card className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left text-[0.82rem]">
                <thead className="border-b border-line text-[0.7rem] uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 text-right font-semibold">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {FUNNEL_EVENTS.map((event) => (
                    <tr key={event}>
                      <td className="px-4 py-3 font-mono text-ink">{event}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">
                        {(events.counts[event] ?? 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
