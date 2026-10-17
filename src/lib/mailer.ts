import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { CONTACT } from "./pricing";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  categoryLabel,
  topicLabel,
  type TicketPriority,
  type TicketStatus,
} from "./support-topics";

/**
 * Ticket notification email.
 *
 * Sent through Cloudflare's `send_email` binding (see wrangler.jsonc), which
 * requires:
 *   - Email Routing enabled on the zone (caelmont.in — it is),
 *   - the destination address verified in Email Routing (it is),
 *   - `from` on that zone, matching `allowed_sender_addresses`.
 *
 * There is no third-party mail API and no API key to leak. Sending is always
 * best-effort: the ticket is committed to Supabase first, so a mail failure
 * costs a notification, never a customer's request.
 */

type EmailAddress = { email: string; name?: string };

type EmailBinding = {
  send: (message: {
    to: string | string[] | EmailAddress | EmailAddress[];
    from: string | EmailAddress;
    subject: string;
    reply_to?: string | EmailAddress;
    text?: string;
    html?: string;
  }) => Promise<unknown>;
};

function emailBinding(): EmailBinding | null {
  try {
    const env = getCloudflareContext()?.env as
      | Record<string, unknown>
      | undefined;
    const binding = env?.SEND_EMAIL;
    if (binding && typeof (binding as EmailBinding).send === "function") {
      return binding as EmailBinding;
    }
    return null;
  } catch {
    // Outside the Worker runtime (next build, unit tests) there is no context.
    return null;
  }
}

export type TicketEmailPayload = {
  ticketCode: string;
  category: string;
  topic: string;
  subject: string;
  message: string;
  customerName: string | null;
  customerEmail: string;
  orderCode: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  /** ISO timestamp. */
  createdAt: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function plainBody(t: TicketEmailPayload): string {
  const lines = [
    `${PRIORITY_LABEL[t.priority].toUpperCase()} · ${categoryLabel(t.category)}`,
    "",
    `Ticket:   ${t.ticketCode}`,
    `Topic:    ${topicLabel(t.category, t.topic)}`,
    `From:     ${t.customerName ? `${t.customerName} <${t.customerEmail}>` : t.customerEmail}`,
    t.orderCode ? `Order:    ${t.orderCode}` : null,
    `Status:   ${STATUS_LABEL[t.status]}`,
    "",
    "------------------------------------------------------------",
    t.subject,
    "------------------------------------------------------------",
    "",
    t.message,
    "",
    "------------------------------------------------------------",
    `Reply to this email and it goes straight to ${t.customerEmail}.`,
    `Open the ticket queue: ${siteUrl()}/admin/support/${t.ticketCode}`,
  ].filter((l): l is string => l !== null);

  return lines.join("\n");
}

function htmlBody(t: TicketEmailPayload): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b6259;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:4px 0;color:#14110e">${value}</td></tr>`;

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#fbfaf7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e7e2da;border-radius:16px;padding:24px">
    <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b6259">ClientFlow support</p>
    <h1 style="margin:8px 0 4px;font-size:20px;color:#14110e">${escapeHtml(PRIORITY_LABEL[t.priority])} — ${escapeHtml(categoryLabel(t.category))}</h1>
    <p style="margin:0 0 16px;font-size:14px;color:#6b6259"><strong style="color:#b24d26">${escapeHtml(t.ticketCode)}</strong> · ${escapeHtml(topicLabel(t.category, t.topic))}</p>
    <table style="border-collapse:collapse;font-size:14px">
      ${row("From", `${escapeHtml(t.customerName ?? "—")} &lt;${escapeHtml(t.customerEmail)}&gt;`)}
      ${row("Order code", escapeHtml(t.orderCode ?? "—"))}
      ${row("Status", escapeHtml(STATUS_LABEL[t.status]))}
      ${row("Received", escapeHtml(new Date(t.createdAt).toUTCString()))}
    </table>
    <h2 style="margin:20px 0 6px;font-size:15px;color:#14110e">${escapeHtml(t.subject)}</h2>
    <pre style="margin:0;padding:14px;background:#fbfaf7;border:1px solid #e7e2da;border-radius:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;color:#14110e">${escapeHtml(t.message)}</pre>
    <p style="margin:20px 0 0;font-size:13px;color:#6b6259">Reply to this email to answer ${escapeHtml(t.customerEmail)} directly.</p>
    <p style="margin:8px 0 0;font-size:13px"><a href="${siteUrl()}/admin/support" style="color:#b24d26">Open the ticket queue</a></p>
  </div>
</body></html>`;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export type SendResult = { sent: boolean; reason?: string };

/**
 * Fire the notification. Never throws — callers treat a failure as "email did
 * not go out", and the ticket is already safely in the database.
 */
export async function sendTicketNotification(
  ticket: TicketEmailPayload,
): Promise<SendResult> {
  const binding = emailBinding();
  if (!binding) {
    console.warn("[mailer] SEND_EMAIL binding unavailable; skipping notification");
    return { sent: false, reason: "binding-unavailable" };
  }

  const subject = `[${PRIORITY_LABEL[ticket.priority]}] ${ticket.ticketCode} · ${topicLabel(ticket.category, ticket.topic)}`;
  const text = plainBody(ticket);
  const html = htmlBody(ticket);

  // Primary shape: object `from` plus an explicit Reply-To.
  try {
    await binding.send({
      to: CONTACT.notifyEmail,
      from: { email: CONTACT.sendFromEmail, name: CONTACT.sendFromName },
      reply_to: { email: ticket.customerEmail, name: ticket.customerName ?? undefined },
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.warn("[mailer] primary send failed, retrying with plain sender:", error);
  }

  // Fallback shape: some runtime versions want a string sender and no reply_to.
  try {
    await binding.send({
      to: CONTACT.notifyEmail,
      from: `${CONTACT.sendFromName} <${CONTACT.sendFromEmail}>`,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[mailer] ticket notification could not be sent:", error);
    return { sent: false, reason: "send-failed" };
  }
}
