import "server-only";

import {
  FUNNEL_EVENTS,
  getDb,
  type DownloadRow,
  type OrderRow,
} from "./orders";

/**
 * Read-only queries for the owner admin panel. Everything degrades to null /
 * empty when Supabase is unconfigured or the optional tables are missing, so a
 * page never throws on a fresh deployment.
 */

export const ORDER_STATUSES = ["created", "paid", "failed"] as const;
export type OrderStatusFilter = "all" | (typeof ORDER_STATUSES)[number];

export const ADMIN_PAGE_SIZE = 25;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function clampPage(n: unknown): number {
  const v = Number.parseInt(String(n ?? "1"), 10);
  return Number.isFinite(v) && v > 0 ? v : 1;
}

/** Only pass safe search terms to PostgREST — a Razorpay id or an email. */
export function safeSearchTerm(raw: string): string | null {
  const q = raw.trim();
  return /^[A-Za-z0-9@._+-]{3,60}$/.test(q) ? q : null;
}

export function parseStatus(raw: string | undefined): OrderStatusFilter {
  return (ORDER_STATUSES as readonly string[]).includes(raw ?? "")
    ? (raw as OrderStatusFilter)
    : "all";
}

/* ── Orders ─────────────────────────────────────────────────────────── */

export type OrderPage = {
  rows: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export async function listOrders(opts: {
  status?: string;
  q?: string;
  page?: number;
}): Promise<OrderPage | null> {
  const db = getDb();
  if (!db) return null;

  const status = parseStatus(opts.status);
  const page = clampPage(opts.page);
  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const to = from + ADMIN_PAGE_SIZE - 1;

  let query = db.from("orders").select("*", { count: "exact" });
  if (status !== "all") query = query.eq("status", status);

  const term = safeSearchTerm(opts.q ?? "");
  if (term) {
    query = query.or(
      `provider_order_id.ilike.*${term}*,provider_payment_id.ilike.*${term}*,customer_email.ilike.*${term}*`,
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.warn("[admin] listOrders failed:", error.message);
    return null;
  }
  const total = count ?? 0;
  return {
    rows: (data ?? []) as OrderRow[],
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    pages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

export async function getOrderDetail(reference: string): Promise<{
  order: OrderRow;
  downloads: DownloadRow[];
  downloadCount: number;
} | null> {
  const db = getDb();
  if (!db) return null;

  const term = reference.trim();
  const column = term.startsWith("pay_")
    ? "provider_payment_id"
    : "provider_order_id";
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq(column, term)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<OrderRow>();
  if (error || !data) return null;

  let downloads: DownloadRow[] = [];
  let downloadCount = 0;
  if (data.provider_order_id) {
    try {
      const [list, count] = await Promise.all([
        db
          .from("download_log")
          .select("order_id, ip_hash, created_at")
          .eq("order_id", data.provider_order_id)
          .order("created_at", { ascending: false })
          .limit(50),
        db
          .from("download_log")
          .select("id", { count: "exact", head: true })
          .eq("order_id", data.provider_order_id),
      ]);
      if (!list.error) downloads = (list.data ?? []) as DownloadRow[];
      if (!count.error) downloadCount = count.count ?? 0;
    } catch {
      // download_log not created yet.
    }
  }

  return { order: data, downloads, downloadCount };
}

/* ── Downloads ──────────────────────────────────────────────────────── */

export async function listDownloads(page = 1): Promise<{
  rows: DownloadRow[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  available: boolean;
} | null> {
  const db = getDb();
  if (!db) return null;

  const p = clampPage(page);
  const from = (p - 1) * ADMIN_PAGE_SIZE;
  const to = from + ADMIN_PAGE_SIZE - 1;

  try {
    const { data, error, count } = await db
      .from("download_log")
      .select("order_id, ip_hash, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) return { rows: [], total: 0, page: p, pageSize: ADMIN_PAGE_SIZE, pages: 1, available: false };
    const total = count ?? 0;
    return {
      rows: (data ?? []) as DownloadRow[],
      total,
      page: p,
      pageSize: ADMIN_PAGE_SIZE,
      pages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
      available: true,
    };
  } catch {
    return { rows: [], total: 0, page: p, pageSize: ADMIN_PAGE_SIZE, pages: 1, available: false };
  }
}

/* ── Customers ─────────────────────────────────────────────────────── */

export type CustomerSummary = {
  email: string;
  name: string;
  orders: number;
  paidOrders: number;
  revenuePaise: number;
  lastAt: string | null;
};

/**
 * Customers derived from orders (grouped by email). No separate table — the
 * buyer details captured at checkout are the source of truth.
 */
export async function listCustomers(): Promise<CustomerSummary[] | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("orders")
    .select("customer_name, customer_email, status, amount_paise, created_at, paid_at")
    .not("customer_email", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) {
    console.warn("[admin] listCustomers failed:", error.message);
    return null;
  }

  const map = new Map<string, CustomerSummary>();
  for (const row of (data ?? []) as {
    customer_name: string | null;
    customer_email: string | null;
    status: string;
    amount_paise: number | null;
    created_at: string | null;
    paid_at: string | null;
  }[]) {
    const email = (row.customer_email ?? "").trim().toLowerCase();
    if (!email) continue;
    const cur =
      map.get(email) ??
      ({ email, name: "", orders: 0, paidOrders: 0, revenuePaise: 0, lastAt: null } as CustomerSummary);
    cur.orders += 1;
    if (row.customer_name && !cur.name) cur.name = row.customer_name;
    if (row.status === "paid") {
      cur.paidOrders += 1;
      cur.revenuePaise += row.amount_paise ?? 0;
    }
    const at = row.paid_at ?? row.created_at;
    if (at && (!cur.lastAt || at > cur.lastAt)) cur.lastAt = at;
    map.set(email, cur);
  }

  return [...map.values()].sort(
    (a, b) => b.revenuePaise - a.revenuePaise || a.email.localeCompare(b.email),
  );
}

/* ── Time series ────────────────────────────────────────────────────── */

/** IST calendar day (YYYY-MM-DD) for an ISO timestamp, or null. */
function istDayKey(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The last N IST day keys, oldest first, ending today. */
function lastIstDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(Date.now() + IST_OFFSET_MS - i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

export async function getRevenueSeries(
  days = 14,
): Promise<{ date: string; paise: number }[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("orders")
    .select("amount_paise, paid_at")
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(5000);
  if (error) return [];

  const byDay = new Map<string, number>();
  for (const row of (data ?? []) as { amount_paise: number | null; paid_at: string | null }[]) {
    const key = istDayKey(row.paid_at);
    if (key) byDay.set(key, (byDay.get(key) ?? 0) + (row.amount_paise ?? 0));
  }
  return lastIstDays(days).map((date) => ({ date, paise: byDay.get(date) ?? 0 }));
}

export type EventStats = {
  available: boolean;
  counts: Partial<Record<string, number>>;
  daily: { date: string; count: number }[];
  total: number;
};

export async function getEventStats(days = 14): Promise<EventStats> {
  const db = getDb();
  const empty: EventStats = { available: false, counts: {}, daily: [], total: 0 };
  if (!db) return empty;

  const startIso = new Date(Date.now() - days * 86_400_000).toISOString();
  try {
    const [counts, rowsRes] = await Promise.all([
      Promise.all(
        FUNNEL_EVENTS.map((event) =>
          db
            .from("analytics_events")
            .select("id", { count: "exact", head: true })
            .eq("event", event),
        ),
      ),
      db
        .from("analytics_events")
        .select("created_at")
        .gte("created_at", startIso)
        .limit(20000),
    ]);
    if (counts[0]?.error || rowsRes.error) return empty;

    const countMap: Partial<Record<string, number>> = {};
    FUNNEL_EVENTS.forEach((event, i) => {
      countMap[event] = counts[i].count ?? 0;
    });

    const byDay = new Map<string, number>();
    for (const row of (rowsRes.data ?? []) as { created_at: string | null }[]) {
      const key = istDayKey(row.created_at);
      if (key) byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    const daily = lastIstDays(days).map((date) => ({ date, count: byDay.get(date) ?? 0 }));
    return {
      available: true,
      counts: countMap,
      daily,
      total: daily.reduce((sum, d) => sum + d.count, 0),
    };
  } catch {
    return empty;
  }
}

/* ── System status ──────────────────────────────────────────────────── */

export type StatusCheck = {
  name: string;
  level: "pass" | "warn" | "fail";
  detail?: string;
};

export async function getSystemStatus(): Promise<StatusCheck[]> {
  const out: StatusCheck[] = [];
  const env = process.env;
  const keyId = env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const envVars = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DOWNLOAD_TOKEN_SECRET",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "ADMIN_SECRET",
  ];
  for (const name of envVars) {
    out.push(
      env[name]
        ? { name: `env ${name}`, level: "pass" }
        : { name: `env ${name}`, level: "fail", detail: "missing" },
    );
  }
  out.push(
    keyId
      ? { name: "env RAZORPAY_KEY_ID", level: "pass" }
      : { name: "env RAZORPAY_KEY_ID", level: "fail", detail: "missing" },
  );

  const db = getDb();
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!db || !url || !key) {
    out.push({ name: "supabase", level: "warn", detail: "not configured" });
    return out;
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  for (const table of ["orders", "analytics_events", "download_log"]) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
      if (res.ok) out.push({ name: `table ${table}`, level: "pass" });
      else {
        const body = await res.text();
        if (res.status === 404 || /does not exist|schema cache|Could not find the table/i.test(body)) {
          out.push({ name: `table ${table}`, level: "warn", detail: "not created — run supabase/schema.sql" });
        } else {
          out.push({ name: `table ${table}`, level: "fail", detail: `HTTP ${res.status}` });
        }
      }
    } catch (error) {
      out.push({ name: `table ${table}`, level: "fail", detail: (error as Error).message });
    }
  }

  const bucket = env.DELIVERABLE_BUCKET || "clientflow-deliverables";
  const deliverable = "clientflow-outreach-kit.zip";
  try {
    const res = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers });
    if (!res.ok) {
      out.push({ name: `storage bucket ${bucket}`, level: "fail", detail: `HTTP ${res.status}` });
    } else {
      out.push({ name: `storage bucket ${bucket}`, level: "pass" });
      const head = await fetch(`${url}/storage/v1/object/${bucket}/${deliverable}`, {
        method: "HEAD",
        headers,
      });
      out.push(
        head.ok
          ? { name: `deliverable ${deliverable}`, level: "pass" }
          : { name: `deliverable ${deliverable}`, level: "fail", detail: `HTTP ${head.status} — run npm run upload:deliverable` },
      );
    }
  } catch (error) {
    out.push({ name: "supabase storage", level: "fail", detail: (error as Error).message });
  }

  if (keyId && env.RAZORPAY_KEY_SECRET) {
    try {
      const auth = Buffer.from(`${keyId}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders?count=1", {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (res.ok) out.push({ name: "razorpay keys authenticate", level: "pass" });
      else if (res.status === 401) out.push({ name: "razorpay keys authenticate", level: "fail", detail: "401" });
      else out.push({ name: "razorpay keys authenticate", level: "warn", detail: `HTTP ${res.status}` });
    } catch (error) {
      out.push({ name: "razorpay keys authenticate", level: "fail", detail: (error as Error).message });
    }
  }

  return out;
}
