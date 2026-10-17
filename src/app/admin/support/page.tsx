import Link from "next/link";
import { connection } from "next/server";

import {
  Card,
  Empty,
  PageHeading,
  Pager,
  PriorityPill,
  Stat,
  TicketStatusPill,
  formatIst,
} from "@/components/admin/ui";
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  SUPPORT_CATEGORIES,
  TICKET_STATUSES,
  categoryLabel,
  isTicketStatus,
  topicLabel,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/support-topics";
import {
  ACTIVE_STATUSES,
  listSupportTickets,
  supportOverview,
} from "@/lib/tickets";

type StatusFilter = TicketStatus | "active" | "all";

function parseStatus(value: string | undefined): StatusFilter {
  if (value === "active") return "active";
  if (isTicketStatus(value)) return value;
  return "active";
}

function parsePriority(value: string | undefined): TicketPriority | "all" {
  return (PRIORITY_ORDER as readonly string[]).includes(value ?? "")
    ? (value as TicketPriority)
    : "all";
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
    priority?: string;
    q?: string;
    page?: string;
  }>;
}) {
  await connection();
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const category = sp.category ?? "all";
  const priority = parsePriority(sp.priority);
  const q = (sp.q ?? "").trim();

  const [overview, queue] = await Promise.all([
    supportOverview(),
    listSupportTickets({ status, category, priority, q, page: Number(sp.page) }),
  ]);

  const tabs: { value: StatusFilter; label: string; count?: number }[] = [
    { value: "active", label: "Needs action", count: overview ? ACTIVE_STATUSES.reduce((n, s) => n + overview.byStatus[s], 0) : undefined },
    ...TICKET_STATUSES.map((s) => ({
      value: s as StatusFilter,
      label: STATUS_LABEL[s],
      count: overview?.byStatus[s],
    })),
    { value: "all", label: "All", count: overview?.total },
  ];

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      status: status === "active" ? undefined : status,
      category: category === "all" ? undefined : category,
      priority: priority === "all" ? undefined : priority,
      q: q || undefined,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    return `/admin/support${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Support"
        subtitle="Every ticket a customer has opened, grouped by what went wrong. Urgent means someone has already paid and is stuck."
      />

      {!overview || !queue ? (
        <Card className="p-5 text-[0.9rem] text-muted">
          Supabase is not configured, or the <code>support_tickets</code> table has
          not been created yet. Run <code>npm run db:apply</code>.
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Needs action"
              value={ACTIVE_STATUSES.reduce((n, s) => n + overview.byStatus[s], 0)}
              hint="Open, in progress or waiting"
            />
            <Stat
              label="Urgent & open"
              value={overview.urgentOpen}
              hint="Paid money, still blocked"
            />
            <Stat label="Resolved" value={overview.byStatus.resolved} hint="Answered" />
            <Stat
              label="Total tickets"
              value={overview.total}
              hint={overview.truncated ? "Most recent 2,000" : "All time"}
            />
          </div>

          {/* ── What people are writing in about ─────────────────── */}
          {overview.byCategory.length > 0 ? (
            <Card className="p-5">
              <p className="eyebrow">By category</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {overview.byCategory.map((row) => {
                  const active = category === row.id;
                  return (
                    <li key={row.id}>
                      <Link
                        href={buildHref({ category: active ? undefined : row.id, page: undefined })}
                        prefetch={false}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-[0.84rem] transition-colors ${
                          active
                            ? "border-ink bg-ink text-ivory"
                            : "border-line bg-paper text-ink hover:border-line-strong"
                        }`}
                      >
                        <span className="truncate">{categoryLabel(row.id)}</span>
                        <span className="flex shrink-0 items-center gap-2 tabular-nums">
                          {row.needingAction > 0 ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
                                active ? "bg-ivory/20 text-ivory" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {row.needingAction} open
                            </span>
                          ) : null}
                          <span className={active ? "text-ivory/70" : "text-muted"}>
                            {row.count}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}

          {/* ── Search + filters ────────────────────────────────── */}
          <div className="space-y-4">
            <form
              method="get"
              action="/admin/support"
              className="flex flex-wrap items-end gap-3"
            >
              {status !== "active" ? <input type="hidden" name="status" value={status} /> : null}
              {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
              {priority !== "all" ? <input type="hidden" name="priority" value={priority} /> : null}
              <div className="min-w-[16rem] flex-1">
                <label htmlFor="q" className="mb-1.5 block text-[0.78rem] font-semibold text-ink">
                  Search tickets
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={q}
                  placeholder="code, email, order code or words from the message"
                  className="h-11 w-full rounded-xl border border-line-strong bg-paper px-4 text-[0.85rem] text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                const active = status === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={buildHref({
                      status: tab.value === "active" ? undefined : tab.value,
                      page: undefined,
                    })}
                    prefetch={false}
                    className={`rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold transition-colors ${
                      active ? "border-ink bg-ink text-ivory" : "border-line text-muted hover:text-ink"
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined ? (
                      <span className={active ? " text-ivory/70" : " text-muted/70"}>
                        {" "}
                        {tab.count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.75rem] uppercase tracking-wider text-muted">
                Priority
              </span>
              {(["all", ...PRIORITY_ORDER] as const).map((p) => {
                const active = priority === p;
                return (
                  <Link
                    key={p}
                    href={buildHref({
                      priority: p === "all" ? undefined : p,
                      page: undefined,
                    })}
                    prefetch={false}
                    className={`rounded-full border px-3 py-1 text-[0.76rem] font-semibold transition-colors ${
                      active ? "border-ink bg-ink text-ivory" : "border-line text-muted hover:text-ink"
                    }`}
                  >
                    {p === "all" ? "Any" : PRIORITY_LABEL[p]}
                  </Link>
                );
              })}
              {category !== "all" ? (
                <Link
                  href={buildHref({ category: undefined, page: undefined })}
                  prefetch={false}
                  className="ml-1 text-[0.76rem] text-accent underline underline-offset-2"
                >
                  clear category
                </Link>
              ) : null}
            </div>
          </div>

          {/* ── Queue ───────────────────────────────────────────── */}
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-[0.82rem]">
              <thead className="border-b border-line text-[0.7rem] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Ticket</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Problem</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {queue.rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <Empty>
                        {overview.total === 0
                          ? "No tickets yet. They land here the moment someone uses the /support form."
                          : "No tickets match these filters."}
                      </Empty>
                    </td>
                  </tr>
                ) : (
                  queue.rows.map((ticket) => {
                    const tStatus = isTicketStatus(ticket.status) ? ticket.status : "open";
                    return (
                      <tr key={ticket.id} className="align-top">
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {formatIst(ticket.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/support/${ticket.ticket_code}`}
                            prefetch={false}
                            className="font-mono text-[0.8rem] font-semibold text-ink hover:text-accent hover:underline"
                          >
                            {ticket.ticket_code}
                          </Link>
                          {ticket.order_code ? (
                            <span className="block font-mono text-[0.68rem] text-muted">
                              {ticket.order_code}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className="block max-w-[13rem] truncate text-ink">
                            {ticket.customer_name || "—"}
                          </span>
                          <span className="block max-w-[13rem] truncate font-mono text-[0.7rem] text-muted">
                            {ticket.customer_email}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="block max-w-[20rem] truncate text-ink">
                            {topicLabel(ticket.category, ticket.topic)}
                          </span>
                          <span className="block max-w-[20rem] truncate text-[0.72rem] text-muted">
                            {categoryLabel(ticket.category)} · {ticket.subject}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <PriorityPill priority={ticket.priority} />
                        </td>
                        <td className="px-4 py-3">
                          <TicketStatusPill status={tStatus} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <Pager
              basePath="/admin/support"
              query={{
                status: status === "active" ? undefined : status,
                category: category === "all" ? undefined : category,
                priority: priority === "all" ? undefined : priority,
                q: q || undefined,
              }}
              page={queue.page}
              pages={queue.pages}
            />
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[0.78rem] text-muted">
            <p>
              {queue.total.toLocaleString("en-IN")} ticket
              {queue.total === 1 ? "" : "s"} matching · {SUPPORT_CATEGORIES.length}{" "}
              categories,{" "}
              {SUPPORT_CATEGORIES.reduce((n, c) => n + c.topics.length, 0)} problem types
            </p>
            <p>New tickets also send a notification email.</p>
          </div>
        </>
      )}
    </div>
  );
}
