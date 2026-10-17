import { Card, PageHeading } from "@/components/admin/ui";
import { getSystemStatus, type StatusCheck } from "@/lib/admin-data";
import { DOWNLOAD_TOKEN_TTL_SECONDS, WEBSITE_URL } from "@/lib/config";
import { DELIVERY, REFUND_WINDOW_DAYS, activePrice } from "@/lib/pricing";
import { connection } from "next/server";

const TONE: Record<StatusCheck["level"], string> = {
  pass: "bg-accent-tint text-accent",
  warn: "bg-amber-100 text-amber-700",
  fail: "bg-red-50 text-red-700",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-[0.85rem] text-muted">{label}</span>
      <span className="font-mono text-[0.82rem] text-ink">{value}</span>
    </li>
  );
}

export default async function AdminStatusPage() {
  await connection();
  const checks = await getSystemStatus();

  return (
    <div className="space-y-10">
      <PageHeading
        title="Status"
        subtitle="Live check of every dependency — the same checks as npm run health, in-app."
      />

      <section>
        <h2 className="display text-[1.15rem] text-ink">Dependencies</h2>
        <Card className="mt-3 overflow-hidden">
          <ul className="divide-y divide-line">
            {checks.map((check) => (
              <li
                key={check.name}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <span className="text-[0.85rem] text-ink">{check.name}</span>
                <span className="flex items-center gap-3">
                  {check.detail ? (
                    <span className="text-[0.78rem] text-muted">{check.detail}</span>
                  ) : null}
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider ${TONE[check.level]}`}
                  >
                    {check.level}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="display text-[1.15rem] text-ink">Configuration</h2>
        <Card className="mt-3 overflow-hidden">
          <ul className="divide-y divide-line">
            <Row label="Price charged" value={`₹${activePrice()}`} />
            <Row
              label="Download link TTL"
              value={`${Math.round(DOWNLOAD_TOKEN_TTL_SECONDS / 86400)} days`}
            />
            <Row label="Refund window" value={`${REFUND_WINDOW_DAYS} days`} />
            <Row label="Deliverable" value={DELIVERY.paidBundleFile} />
            <Row
              label="Delivery bucket"
              value={process.env.DELIVERABLE_BUCKET ?? "clientflow-deliverables"}
            />
            <Row label="Site URL" value={WEBSITE_URL} />
          </ul>
        </Card>
      </section>
    </div>
  );
}
