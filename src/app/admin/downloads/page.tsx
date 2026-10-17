import Link from "next/link";
import { connection } from "next/server";

import {
  Card,
  Empty,
  PageHeading,
  Pager,
  formatIst,
  shortId,
} from "@/components/admin/ui";
import { listDownloads } from "@/lib/admin-data";

export const instant = false;

export default async function AdminDownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const sp = await searchParams;
  const data = await listDownloads(Number(sp.page));

  return (
    <div className="space-y-8">
      <PageHeading
        title="Downloads"
        subtitle="Every delivery of the paid kit — order id and a salted IP hash (never the raw address)."
      />

      {!data ? (
        <Card className="p-5 text-[0.9rem] text-muted">Supabase is not configured.</Card>
      ) : !data.available ? (
        <Card className="p-5 text-[0.9rem] text-muted">
          Not available — run <span className="font-mono">supabase/schema.sql</span> to
          create <span className="font-mono">download_log</span>.
        </Card>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-[0.82rem]">
              <thead className="border-b border-line text-[0.7rem] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">IP hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <Empty>No downloads logged yet.</Empty>
                    </td>
                  </tr>
                ) : (
                  data.rows.map((row, i) => (
                    <tr key={`${row.order_id}-${row.created_at}-${i}`}>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {formatIst(row.created_at)}
                      </td>
                      <td className="px-4 py-3 font-mono text-ink">
                        {row.order_id ? (
                          <Link
                            href={`/admin/orders/${row.order_id}`}
                            prefetch={false}
                            className="hover:text-accent hover:underline"
                          >
                            {shortId(row.order_id)}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted">
                        {row.ip_hash ? row.ip_hash.slice(0, 12) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pager
              basePath="/admin/downloads"
              query={{}}
              page={data.page}
              pages={data.pages}
            />
          </Card>
          <p className="text-[0.78rem] text-muted">
            {data.total.toLocaleString("en-IN")} download
            {data.total === 1 ? "" : "s"} logged.
          </p>
        </>
      )}
    </div>
  );
}
