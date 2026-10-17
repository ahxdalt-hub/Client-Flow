import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Card,
  PageHeading,
  PriorityPill,
  TicketStatusPill,
  formatIst,
  inr,
} from "@/components/admin/ui";
import { TicketActions } from "@/components/admin/ticket-actions";
import { CONTACT } from "@/lib/pricing";
import { findPaidOrderByCode } from "@/lib/orders";
import {
  STATUS_LABEL,
  categoryLabel,
  isTicketStatus,
  topicLabel,
  type TicketPriority,
  PRIORITY_ORDER,
} from "@/lib/support-topics";
import { getSupportTicketByCode } from "@/lib/tickets";

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const { ticketCode } = await params;
  const ticket = await getSupportTicketByCode(ticketCode);
  if (!ticket) notFound();

  const status = isTicketStatus(ticket.status) ? ticket.status : "open";
  const priority = (PRIORITY_ORDER as readonly string[]).includes(ticket.priority)
    ? (ticket.priority as TicketPriority)
    : "normal";

  // Cross-check the quoted order code against a real paid order. This is the
  // same reasoning the refund panel uses: never refund on a customer's word
  // alone, check the row.
  const order = ticket.order_code
    ? await findPaidOrderByCode(ticket.order_code)
    : null;

  const replySubject = `Re: ${ticket.subject} [${ticket.ticket_code}]`;
  const replyBody = [
    "",
    "",
    `— your original message (${ticket.ticket_code}) —`,
    ticket.message,
  ].join("\n");
  const mailto = `mailto:${encodeURIComponent(ticket.customer_email)}?subject=${encodeURIComponent(
    replySubject,
  )}&body=${encodeURIComponent(replyBody)}`;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/support"
          prefetch={false}
          className="text-[0.8rem] text-muted underline underline-offset-2 hover:text-ink"
        >
          ← Back to the support queue
        </Link>
        <div className="mt-4">
          <PageHeading
            title={ticket.ticket_code}
            subtitle={topicLabel(ticket.category, ticket.topic)}
            right={
              <div className="flex items-center gap-2">
                <PriorityPill priority={priority} />
                <TicketStatusPill status={status} />
              </div>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* ── The request itself ──────────────────────────────── */}
        <div className="space-y-6">
          <Card className="p-5">
            <p className="eyebrow">Subject</p>
            <p className="mt-2 text-[1.05rem] font-semibold text-ink">{ticket.subject}</p>
            <p className="mt-1 text-[0.76rem] text-muted">
              {categoryLabel(ticket.category)} · received{" "}
              {formatIst(ticket.created_at)} · last updated {formatIst(ticket.updated_at)}
            </p>
            <pre className="mt-5 rounded-xl border border-line bg-ivory p-4 font-mono text-[0.82rem] leading-relaxed whitespace-pre-wrap text-ink">
              {ticket.message}
            </pre>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5 text-[0.86rem]">
              <a
                href={mailto}
                className="rounded-full bg-ink px-5 py-2.5 font-semibold text-ivory"
              >
                Reply to {ticket.customer_email}
              </a>
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(replySubject)}`}
                className="rounded-full border border-line px-5 py-2.5 font-semibold text-ink"
              >
                Forward to the support inbox
              </a>
            </div>
          </Card>

          <Card className="p-5">
            <p className="eyebrow">Work it</p>
            <p className="mt-2 mb-5 text-[0.85rem] leading-relaxed text-muted">
              Move the ticket on when you act on it. &ldquo;Waiting on customer&rdquo;
              keeps it out of the queue until they answer.
            </p>
            <TicketActions
              id={ticket.id}
              status={status}
              priority={priority}
              adminNote={ticket.admin_note}
            />
          </Card>
        </div>

        {/* ── Who, and what they paid ─────────────────────────── */}
        <div className="space-y-6">
          <Card className="p-5">
            <p className="eyebrow">Customer</p>
            <dl className="mt-3 space-y-2.5 text-[0.85rem]">
              <div>
                <dt className="text-[0.72rem] uppercase tracking-wider text-muted">Name</dt>
                <dd className="text-ink">{ticket.customer_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-[0.72rem] uppercase tracking-wider text-muted">Email</dt>
                <dd className="break-all font-mono text-[0.8rem] text-ink">
                  {ticket.customer_email}
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] uppercase tracking-wider text-muted">
                  Quoted order code
                </dt>
                <dd className="font-mono text-[0.85rem] text-ink">
                  {ticket.order_code ?? "—"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <p className="eyebrow">Order cross-check</p>
            {!ticket.order_code ? (
              <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
                No order code on this ticket. Search the customer&apos;s email on{" "}
                <Link
                  href={`/admin/orders?q=${encodeURIComponent(ticket.customer_email)}`}
                  prefetch={false}
                  className="text-accent underline underline-offset-2"
                >
                  the orders page
                </Link>{" "}
                to find a payment.
              </p>
            ) : order ? (
              <div className="mt-3 space-y-2.5 text-[0.85rem]">
                <p className="rounded-lg bg-accent-tint px-3 py-2 text-[0.82rem] font-semibold text-accent">
                  Paid order found — safe to refund or reissue.
                </p>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-wider text-muted">
                      Razorpay order
                    </dt>
                    <dd className="break-all font-mono text-[0.78rem] text-ink">
                      {order.provider_order_id ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-wider text-muted">
                      Razorpay payment
                    </dt>
                    <dd className="break-all font-mono text-[0.78rem] text-ink">
                      {order.provider_payment_id ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-wider text-muted">
                      Amount / paid at
                    </dt>
                    <dd className="text-ink">
                      {order.amount_paise != null ? inr(order.amount_paise) : "—"} ·{" "}
                      {formatIst(order.paid_at)}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-3 pt-1 text-[0.82rem]">
                  <Link
                    href={`/admin/orders/${order.provider_order_id ?? order.id}`}
                    prefetch={false}
                    className="text-accent underline underline-offset-2"
                  >
                    Open the order
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
                No <strong className="text-ink">paid</strong> order matches{" "}
                <span className="font-mono">{ticket.order_code}</span>. Do not refund
                on this ticket alone — check the payment reference the customer
                quotes.{" "}
                <Link
                  href={`/admin/orders?q=${encodeURIComponent(ticket.order_code)}`}
                  prefetch={false}
                  className="text-accent underline underline-offset-2"
                >
                  Search orders
                </Link>
              </p>
            )}
          </Card>

          <Card className="p-5">
            <p className="eyebrow">Timeline</p>
            <ul className="mt-3 space-y-3 text-[0.83rem]">
              <li>
                <span className="block text-muted">Created</span>
                <span className="text-ink">{formatIst(ticket.created_at)}</span>
              </li>
              <li>
                <span className="block text-muted">Last updated</span>
                <span className="text-ink">{formatIst(ticket.updated_at)}</span>
              </li>
              <li>
                <span className="block text-muted">First actioned</span>
                <span className="text-ink">{formatIst(ticket.replied_at)}</span>
              </li>
              <li>
                <span className="block text-muted">Current status</span>
                <span className="text-ink">{STATUS_LABEL[status]}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
