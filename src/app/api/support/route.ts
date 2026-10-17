import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { sendTicketNotification } from "@/lib/mailer";
import { isOrderCode, normalizeOrderCode } from "@/lib/order-code";
import { logEvent } from "@/lib/orders";
import { RATE_LIMITS, checkRateLimit, clientIp } from "@/lib/rate-limit";
import { getCategory, getTopic } from "@/lib/support-topics";
import { createSupportTicket } from "@/lib/tickets";

/**
 * Public support ticket intake.
 *
 * Order of operations matters: the ticket is written to the database *first*
 * and the notification email is fired afterwards, best-effort. A mail outage
 * then costs a notification — never the customer's request.
 */

type Body = {
  category?: unknown;
  topic?: unknown;
  subject?: unknown;
  message?: unknown;
  name?: unknown;
  email?: unknown;
  orderCode?: unknown;
  /** Honeypot. Real people never fill this in. */
  website?: unknown;
  consent?: unknown;
};

const LIMITS = {
  subjectMin: 4,
  subjectMax: 140,
  messageMin: 20,
  messageMax: 5000,
  nameMax: 80,
  emailMax: 200,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** Salted, truncated hash — the same treatment as the download audit log. */
function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`clientflow-support:${ip}`)
    .digest("hex")
    .slice(0, 24);
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`support:${ip}`, RATE_LIMITS.support);
  if (!rate.ok) {
    return NextResponse.json(
      {
        error:
          "That's several requests in a row. Please wait a few minutes, or email us directly.",
      },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Honeypot: pretend it worked so the bot does not retry, but store nothing.
  if (asString(body.website)) {
    return NextResponse.json({ ok: true, ticketCode: "CFT-000000" });
  }

  const category = asString(body.category);
  const topic = asString(body.topic);
  const subject = asString(body.subject);
  const message = asString(body.message);
  const name = asString(body.name).slice(0, LIMITS.nameMax);
  const email = asString(body.email).slice(0, LIMITS.emailMax);
  const rawOrderCode = asString(body.orderCode);

  const categoryDef = getCategory(category);
  if (!categoryDef) {
    return NextResponse.json({ error: "Choose what this is about." }, { status: 400 });
  }
  const topicDef = getTopic(category, topic);
  if (!topicDef) {
    return NextResponse.json(
      { error: "Choose the problem that fits best." },
      { status: 400 },
    );
  }
  if (subject.length < LIMITS.subjectMin || subject.length > LIMITS.subjectMax) {
    return NextResponse.json(
      { error: `Add a subject between ${LIMITS.subjectMin} and ${LIMITS.subjectMax} characters.` },
      { status: 400 },
    );
  }
  if (message.length < LIMITS.messageMin) {
    return NextResponse.json(
      { error: `Please describe the problem in at least ${LIMITS.messageMin} characters.` },
      { status: 400 },
    );
  }
  if (message.length > LIMITS.messageMax) {
    return NextResponse.json(
      { error: "That message is too long — trim it to 5000 characters." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address so we can reply." },
      { status: 400 },
    );
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Please confirm we may use your email to reply." },
      { status: 400 },
    );
  }

  let orderCode: string | null = null;
  if (rawOrderCode) {
    if (!isOrderCode(rawOrderCode)) {
      return NextResponse.json(
        { error: "Order codes look like CF-7K2M9Q. Leave it blank if you don't have one." },
        { status: 400 },
      );
    }
    orderCode = normalizeOrderCode(rawOrderCode);
  }

  const ticket = await createSupportTicket({
    category,
    topic,
    subject,
    message,
    customerName: name || null,
    customerEmail: email,
    orderCode,
    ipHash: hashIp(ip),
  });

  if (!ticket) {
    return NextResponse.json(
      {
        error:
          "We couldn't save that just now. Please try again in a moment, or email support directly.",
      },
      { status: 503 },
    );
  }

  // Best-effort notification — a failure here must not fail the submission.
  const mail = await sendTicketNotification({
    ticketCode: ticket.ticket_code,
    category: ticket.category,
    topic: ticket.topic,
    subject: ticket.subject,
    message: ticket.message,
    customerName: ticket.customer_name,
    customerEmail: ticket.customer_email,
    orderCode: ticket.order_code,
    priority: ticket.priority as "urgent" | "high" | "normal" | "low",
    status: "open",
    createdAt: ticket.created_at,
  });

  if (!mail.sent) {
    console.error(
      `[support] ticket ${ticket.ticket_code} stored but not emailed (${mail.reason})`,
    );
  }

  await logEvent("support_ticket_created", {
    category,
    topic,
    ticketCode: ticket.ticket_code,
    orderCode,
    emailed: mail.sent,
  });

  return NextResponse.json({
    ok: true,
    ticketCode: ticket.ticket_code,
    emailed: mail.sent,
  });
}
