import "server-only";

import { getDb } from "./orders";
import { generateTicketCode } from "./order-code";
import {
  TICKET_STATUSES,
  isTicketStatus,
  priorityFor,
  type TicketPriority,
  type TicketStatus,
} from "./support-topics";

/**
 * Support ticket persistence (Supabase, service role — server-side only).
 *
 * Every function degrades to `null` when Supabase is unconfigured or the table
 * is missing, so the public form can still answer honestly rather than 500.
 */

export type TicketRow = {
  id: string;
  ticket_code: string;
  category: string;
  topic: string;
  subject: string;
  message: string;
  customer_name: string | null;
  customer_email: string;
  order_code: string | null;
  priority: string;
  status: string;
  admin_note: string | null;
  replied_at: string | null;
  source: string;
  created_at: string;
  updated_at: string;
};

export const TICKETS_PAGE_SIZE = 25;

/** Statuses an owner still has to do something about. */
export const ACTIVE_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "waiting",
];

function normaliseStatus(value: string | null | undefined): TicketStatus | null {
  return isTicketStatus(value) ? value : null;
}

export type NewTicket = {
  category: string;
  topic: string;
  subject: string;
  message: string;
  customerName: string | null;
  customerEmail: string;
  orderCode: string | null;
  ipHash: string | null;
};

/**
 * Insert a ticket, retrying the (astronomically unlikely) ticket-code
 * collision. Returns null when the database is unavailable.
 */
export async function createSupportTicket(
  input: NewTicket,
): Promise<TicketRow | null> {
  const db = getDb();
  if (!db) return null;

  const priority: TicketPriority = priorityFor(input.category, input.topic);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const ticket_code = generateTicketCode();
    const { data, error } = await db
      .from("support_tickets")
      .insert({
        ticket_code,
        category: input.category,
        topic: input.topic,
        subject: input.subject,
        message: input.message,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        order_code: input.orderCode,
        priority,
        status: "open",
        source: "web",
        ip_hash: input.ipHash,
      })
      .select("*")
      .single<TicketRow>();

    if (!error) return data;
    // 23505 = unique_violation → only the code can collide here.
    if (error.code !== "23505") {
      console.error("[tickets] insert failed:", error.message);
      return null;
    }
  }

  console.error("[tickets] could not allocate a unique ticket code");
  return null;
}

export type TicketQueue = {
  rows: TicketRow[];
  total: number;
  page: number;
  pages: number;
};

/**
 * Page numbers arrive as `Number(searchParams.page)`, which is `NaN` when the
 * parameter is absent — and `NaN ?? 1` is still `NaN`, which silently made
 * PostgREST's range match nothing. Guard properly.
 */
function clampPage(n: unknown): number {
  const v = Number.parseInt(String(n ?? "1"), 10);
  return Number.isFinite(v) && v > 0 ? v : 1;
}

export async function listSupportTickets(options: {
  status?: TicketStatus | "active" | "all";
  category?: string;
  priority?: TicketPriority | "all";
  q?: string;
  page?: number;
}): Promise<TicketQueue | null> {
  const db = getDb();
  if (!db) return null;

  const page = clampPage(options.page);
  const from = (page - 1) * TICKETS_PAGE_SIZE;

  let query = db
    .from("support_tickets")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + TICKETS_PAGE_SIZE - 1);

  if (options.status === "active") query = query.in("status", ACTIVE_STATUSES);
  else if (options.status && options.status !== "all")
    query = query.eq("status", options.status);

  if (options.category && options.category !== "all")
    query = query.eq("category", options.category);

  if (options.priority && options.priority !== "all")
    query = query.eq("priority", options.priority);

  const term = (options.q ?? "").trim();
  if (term) {
    const safe = term.replace(/[%,()]/g, " ");
    query = query.or(
      [
        `ticket_code.ilike.*${safe}*`,
        `subject.ilike.*${safe}*`,
        `customer_email.ilike.*${safe}*`,
        `customer_name.ilike.*${safe}*`,
        `order_code.ilike.*${safe}*`,
        `message.ilike.*${safe}*`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[tickets] list failed:", error.message);
    return null;
  }

  const total = count ?? 0;
  return {
    rows: (data ?? []) as TicketRow[],
    total,
    page,
    pages: Math.max(1, Math.ceil(total / TICKETS_PAGE_SIZE)),
  };
}

export async function getSupportTicketByCode(
  code: string,
): Promise<TicketRow | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("support_tickets")
    .select("*")
    .eq("ticket_code", code.trim().toUpperCase())
    .maybeSingle<TicketRow>();
  if (error) {
    console.error("[tickets] lookup failed:", error.message);
    return null;
  }
  return data;
}

export async function updateSupportTicket(
  id: string,
  patch: { status?: TicketStatus; adminNote?: string | null; priority?: TicketPriority },
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const status = normaliseStatus(patch.status);
  if (status) {
    update.status = status;
    // Record the moment the owner moved it on, so response times are visible.
    if (status === "resolved") update.replied_at = new Date().toISOString();
  }
  if (patch.adminNote !== undefined) update.admin_note = patch.adminNote;
  if (patch.priority) update.priority = patch.priority;

  const { error } = await db.from("support_tickets").update(update).eq("id", id);
  if (error) {
    console.error("[tickets] update failed:", error.message);
    return false;
  }
  return true;
}

export type TicketOverview = {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byCategory: { id: string; count: number; needingAction: number }[];
  byPriority: Record<TicketPriority, number>;
  /** Somebody paid money and has a problem — these cannot wait. */
  urgentOpen: number;
  /**
   * True when the stats only cover the most recent slice of the table, so the
   * UI can say so instead of quietly under-reporting.
   */
  truncated: boolean;
};

const STATS_CAP = 2000;

export async function supportOverview(): Promise<TicketOverview | null> {
  const db = getDb();
  if (!db) return null;

  const { data, error } = await db
    .from("support_tickets")
    .select("status, category, priority")
    .order("created_at", { ascending: false })
    .limit(STATS_CAP);

  if (error) {
    console.error("[tickets] overview failed:", error.message);
    return null;
  }

  const rows = (data ?? []) as { status: string; category: string; priority: string }[];

  const byStatus = Object.fromEntries(
    TICKET_STATUSES.map((s) => [s, 0]),
  ) as Record<TicketStatus, number>;
  const byPriority: Record<TicketPriority, number> = {
    urgent: 0,
    high: 0,
    normal: 0,
    low: 0,
  };
  const categories = new Map<string, { count: number; needingAction: number }>();
  let urgentOpen = 0;

  for (const row of rows) {
    const status = normaliseStatus(row.status);
    if (status) byStatus[status] += 1;
    if (row.priority in byPriority) {
      byPriority[row.priority as TicketPriority] += 1;
    }
    const entry = categories.get(row.category) ?? { count: 0, needingAction: 0 };
    entry.count += 1;
    if (status && ACTIVE_STATUSES.includes(status)) entry.needingAction += 1;
    categories.set(row.category, entry);
    if (row.priority === "urgent" && status && ACTIVE_STATUSES.includes(status)) {
      urgentOpen += 1;
    }
  }

  return {
    total: rows.length,
    byStatus,
    byCategory: [...categories.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.needingAction - a.needingAction || b.count - a.count),
    byPriority,
    urgentOpen,
    truncated: rows.length >= STATS_CAP,
  };
}

export type { TicketStatus, TicketPriority };
