import Link from "next/link";
import { connection } from "next/server";

import {
  Card,
  Empty,
  PageHeading,
  Pager,
  StatusPill,
  formatIst,
  inr,
  shortId,
} from "@/components/admin/ui";
import { ORDER_STATUSES, listOrders, parseStatus } from "@/lib/admin-data";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await connection();
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const q = (sp.q ?? "").trim();
  const data = await listOrders({ status, q, page: Number(sp.page) });

  const tabs = [
    { value: "all" as const, label: "All" },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        title="Orders"
        subtitle="Every checkout attempt. Search, filter, or open an order to reissue its link."
      />

      <form method="get" action="/admin/orders" className="flex flex-wrap items-end gap-3">
        {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
        <div className="min-w-[16rem] flex-1">
          <label
            htmlFor="q"
            className="mb-1.5 block text-[0.78rem] font-semibold text-ink"
          >
            Search by customer, email or order id
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="order_… or pay_…"
            className="h-11 w-full rounded-xl border border-line-strong bg-paper px-4 font-mono text-[0.85rem] text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button
          type="submit"
          className="h-11 rounded-xl bg-ink px-5 text-[0.85rem] font-semibold text-ivory"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (tab.value !== "all") params.set("status", tab.value);
          const href = `/admin/orders${params.toString() ? `?${params.toString()}` : ""}`;
          const active = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={href}
              prefetch={false}
              className={`rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold transition-colors ${
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {!data ? (
        <Card className="p-5 text-[0.9rem] text-muted">Supabase is not configured.</Card>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-[0.82rem]">
              <thead className="border-b border-line text-[0.7rem] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <Empty>No matching orders.</Empty>
                    </td>
                  </tr>
                ) : (
                  data.rows.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {formatIst(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block max-w-[14rem] truncate text-ink">
                          {order.customer_name || "—"}
                        </span>
                        <span className="block max-w-[14rem] truncate font-mono text-[0.72rem] text-muted">
                          {order.customer_email ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink">
                        <Link
                          href={`/admin/orders/${order.provider_order_id ?? order.id}`}
                          prefetch={false}
                          className="hover:text-accent hover:underline"
                        >
                          {shortId(order.provider_order_id)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-ink">
                        {order.amount_paise != null ? inr(order.amount_paise) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pager
              basePath="/admin/orders"
              query={{
                status: status === "all" ? undefined : status,
                q: q || undefined,
              }}
              page={data.page}
              pages={data.pages}
            />
          </Card>
          <p className="text-[0.78rem] text-muted">
            {data.total.toLocaleString("en-IN")} order
            {data.total === 1 ? "" : "s"} matching.
          </p>
        </>
      )}
    </div>
  );
}
