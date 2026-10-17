import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { ReissueButton } from "@/components/admin/reissue-button";
import {
  Card,
  Empty,
  PageHeading,
  StatusPill,
  formatIst,
  inr,
  shortId,
} from "@/components/admin/ui";
import { getOrderDetail } from "@/lib/admin-data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-[0.88rem] text-ink">{children}</dd>
    </div>
  );
}

const Mono = ({ children }: { children: ReactNode }) => (
  <span className="font-mono text-[0.82rem] break-all">{children}</span>
);

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await connection();
  const { orderId } = await params;
  const detail = await getOrderDetail(orderId);

  const back = (
    <Link
      href="/admin/orders"
      prefetch={false}
      className="rounded-full border border-line px-4 py-2 text-[0.82rem] font-semibold text-ink transition-colors hover:bg-paper"
    >
      ← All orders
    </Link>
  );

  if (!detail) {
    return (
      <div className="space-y-8">
        <PageHeading
          title="Order not found"
          subtitle={`Nothing matches ${orderId}.`}
          right={back}
        />
        <Card className="p-5">
          <p className="text-[0.85rem] text-muted">
            If you have a valid Razorpay id, you can still try to mint a link for a
            paid order:
          </p>
          <div className="mt-4">
            <ReissueButton reference={orderId} />
          </div>
        </Card>
      </div>
    );
  }

  const { order, downloads, downloadCount } = detail;
  const ref = order.provider_order_id ?? order.provider_payment_id ?? orderId;

  return (
    <div className="space-y-8">
      <PageHeading title="Order detail" subtitle={ref} right={back} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <Field label="Status">
              <StatusPill status={order.status} />
            </Field>
            <Field label="Amount">
              {order.amount_paise != null ? inr(order.amount_paise) : "—"}
            </Field>
            <Field label="Customer">{order.customer_name || "—"}</Field>
            <Field label="Email">
              <Mono>{order.customer_email ?? "—"}</Mono>
            </Field>
            <Field label="Phone">{order.customer_phone ?? "—"}</Field>
            <Field label="Order code">
              <span className="font-mono text-[1rem] font-semibold tracking-wide">
                {order.order_code ?? "—"}
              </span>
            </Field>
            <Field label="Order id">
              <Mono>{order.provider_order_id ?? "—"}</Mono>
            </Field>
            <Field label="Payment id">
              <Mono>{order.provider_payment_id ?? "—"}</Mono>
            </Field>
            <Field label="Created">{formatIst(order.created_at)}</Field>
            <Field label="Paid at">{formatIst(order.paid_at)}</Field>
            <Field label="Product">
              <Mono>{order.product_id ?? "—"}</Mono>
            </Field>
            <Field label="Provider">{order.provider ?? "—"}</Field>
          </dl>
        </Card>

        <Card className="p-5">
          <p className="eyebrow">Access</p>
          <p className="mt-2 text-[0.85rem] text-muted">
            {downloadCount} download{downloadCount === 1 ? "" : "s"} logged for this
            order.
          </p>
          <div className="mt-4">
            <ReissueButton reference={ref} />
          </div>

          {/* Refund cross-check: the same identifiers appear in the gateway,
              so a refund request can be confirmed against it before acting. */}
          <div className="mt-5 border-t border-line pt-4">
            <p className="eyebrow !text-[0.62rem]">Refund cross-check</p>
            <dl className="mt-2 space-y-1.5 text-[0.78rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Order code</dt>
                <dd className="font-mono text-ink">{order.order_code ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Provider</dt>
                <dd className="text-ink">{order.provider ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Payment id</dt>
                <dd className="truncate font-mono text-ink">
                  {order.provider_payment_id ?? "—"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[0.72rem] leading-relaxed text-muted">
              To refund: find this <strong>payment id</strong> (or the order
              code) in your payment provider&apos;s dashboard, issue the refund
              there — access is revoked automatically when the refund webhook
              arrives.
            </p>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="display text-[1.15rem] text-ink">Downloads for this order</h2>
        <Card className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-[0.82rem]">
            <thead className="border-b border-line text-[0.7rem] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">IP hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {downloads.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <Empty>No downloads logged for this order.</Empty>
                  </td>
                </tr>
              ) : (
                downloads.map((row, i) => (
                  <tr key={`${row.order_id}-${row.created_at}-${i}`}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {formatIst(row.created_at)}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink">
                      {shortId(row.order_id)}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">
                      {row.ip_hash ? row.ip_hash.slice(0, 12) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
