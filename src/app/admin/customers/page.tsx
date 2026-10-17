import { connection } from "next/server";

import { Card, Empty, PageHeading, formatIst, inr, relTime } from "@/components/admin/ui";
import { listCustomers } from "@/lib/admin-data";

export default async function AdminCustomersPage() {
  await connection();
  const customers = await listCustomers();

  return (
    <div className="space-y-8">
      <PageHeading
        title="Customers"
        subtitle="Every buyer, grouped by the email they used at checkout. Search and reissue from here."
      />

      {!customers ? (
        <Card className="p-5 text-[0.9rem] text-muted">Supabase is not configured.</Card>
      ) : customers.length === 0 ? (
        <Card>
          <Empty>
            No customers yet — the first one lands here the moment someone checks out.
          </Empty>
        </Card>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-[0.82rem]">
              <thead className="border-b border-line text-[0.7rem] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 text-right font-semibold">Orders</th>
                  <th className="px-4 py-3 text-right font-semibold">Paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                  <th className="px-4 py-3 font-semibold">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {customers.map((c) => (
                  <tr key={c.email}>
                    <td className="px-4 py-3 font-mono text-ink">{c.email}</td>
                    <td className="px-4 py-3 text-ink">{c.name || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{c.orders}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {c.paidOrders}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {c.revenuePaise > 0 ? inr(c.revenuePaise) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted" title={formatIst(c.lastAt)}>
                      {relTime(c.lastAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="text-[0.78rem] text-muted">
            {customers.length} customer{customers.length === 1 ? "" : "s"} ·{" "}
            {inr(customers.reduce((sum, c) => sum + c.revenuePaise, 0))} lifetime revenue.
          </p>
        </>
      )}
    </div>
  );
}
