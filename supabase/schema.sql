-- ClientFlow Outreach Kit — Supabase schema
--
-- ── What this project actually contains ─────────────────────────────
-- The connected Supabase project (SUPABASE_URL in Vercel → Environment
-- Variables) already has these tables from the previous application. The
-- storefront is adapted to them as-is:
--
--   orders (used by the storefront now)
--     id                 uuid  PK   (we generate crypto.randomUUID)
--     provider           text        ('razorpay')
--     provider_order_id  text        (Razorpay order id, order_…)
--     provider_payment_id text       (Razorpay payment id, pay_…)
--     product_id         text
--     status             text        CHECK IN ('created','paid','failed')
--     amount_paise       bigint
--     currency           text
--     created_at / paid_at / updated_at  timestamptz
--
--   entitlements, download_events, product_versions  (legacy — unused)
--
-- Notes on this adaptation:
--   * There is no unique constraint on provider_order_id, so the app
--     inserts one row per checkout attempt and marks the newest row paid.
--   * Buyer contact data is intentionally NOT stored here; Razorpay keeps
--     name/email/contact on the payment and it is used for the receipt
--     email — the DB never holds personal data.
--   * `entitlements` / `download_events` / `product_versions` belong to the
--     old application and are untouched. In particular download_events
--     requires an `entitlement_id`, which this app never creates, so the
--     storefront writes its download audit to `download_log` instead.
--
-- ── Optional first-party tables ─────────────────────────────────────
-- Run this whole section once in the Supabase SQL Editor to enable the
-- first-party analytics + download audit. It is safe to re-run
-- (IF NOT EXISTS / no destructive statements). Until it is applied, the
-- app logs those events to the server console and keeps working.

-- ── First-party analytics ──────────────────────────────────────────
create table if not exists public.analytics_events (
  id         bigserial primary key,
  event      text not null,
  props      jsonb not null default '{}',
  path       text,
  referrer   text,
  session_id text,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
-- No policies: server writes happen with the service role (bypasses RLS).

create index if not exists analytics_events_event_idx
  on public.analytics_events (event, created_at desc);

-- ── Download audit log ─────────────────────────────────────────────
-- order_id is the Razorpay order id; ip_hash is a salted, truncated hash —
-- raw IPs are never stored.
create table if not exists public.download_log (
  id         bigserial primary key,
  order_id   text,
  ip_hash    text,
  created_at timestamptz not null default now()
);

alter table public.download_log enable row level security;
-- No policies — server writes via service role.

create index if not exists download_log_order_idx
  on public.download_log (order_id, created_at desc);

-- ── Support tickets (/support → /admin/support) ─────────────────────
-- Written by POST /api/support when a customer submits the ticket form.
-- Read and updated by the owner-only /admin/support panel.
--
-- Personal data held here is deliberately minimal: the email the customer
-- wants a reply at, their name if they gave one, and the message. No IP
-- address — only a salted, truncated hash, used for abuse throttling.
create table if not exists public.support_tickets (
  id             uuid primary key default gen_random_uuid(),
  ticket_code    text not null,
  category       text not null,
  topic          text not null,
  subject        text not null,
  message        text not null,
  customer_name  text,
  customer_email text not null,
  order_code     text,
  priority       text not null default 'normal'
                 check (priority in ('urgent','high','normal','low')),
  status         text not null default 'open'
                 check (status in ('open','in_progress','waiting','resolved','closed')),
  admin_note     text,
  replied_at     timestamptz,
  source         text not null default 'web',
  ip_hash        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.support_tickets enable row level security;
-- No policies — every read and write goes through the service role, and the
-- admin panel is gated by the ADMIN_SECRET cookie. Nothing here is public.

create unique index if not exists support_tickets_code_idx
  on public.support_tickets (ticket_code);

create index if not exists support_tickets_queue_idx
  on public.support_tickets (status, priority, created_at desc);

create index if not exists support_tickets_category_idx
  on public.support_tickets (category, created_at desc);

create index if not exists support_tickets_email_idx
  on public.support_tickets (lower(customer_email));

create index if not exists support_tickets_order_code_idx
  on public.support_tickets (order_code);

-- After these tables exist, the helpers in src/lib/orders.ts
-- (logEvent / logDownload) pick them up automatically — no code change.

-- ── Order lookup indexes (checkout / fulfilment / recovery) ─────────
-- The previous app's `orders` table has no index on these columns, yet
-- every fulfilment and recovery path looks a row up by one of them:
--   * /api/payments/verify + /api/payments/webhook  → provider_order_id
--   * /api/recover (self-serve link recovery)       → provider_order_id
--                                                     or provider_payment_id
-- Idempotent; safe to re-run.
create index if not exists orders_provider_order_id_idx
  on public.orders (provider_order_id);

create index if not exists orders_provider_payment_id_idx
  on public.orders (provider_payment_id);

-- ── Customer details on the order (support + easy tracking) ─────────
-- Name/email/phone are captured at checkout and stored with the order so the
-- owner can find a buyer by email, reissue a link, and spot repeat customers.
-- Payment instrument data (card/UPI) is never stored — Razorpay holds that.
alter table public.orders add column if not exists customer_name  text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_phone text;

-- A short, human-friendly code the buyer can quote for support/refunds
-- (e.g. CF-7K2M9Q). Also mirrored into the Dodo payment metadata so a
-- refund can be cross-checked against the gateway.
alter table public.orders add column if not exists order_code text;

create index if not exists orders_customer_email_idx
  on public.orders (lower(customer_email));

create index if not exists orders_order_code_idx
  on public.orders (order_code);

-- ── Paid deliverable (private Supabase Storage bucket) ──────────────
-- `assets/deliverables/` is gitignored, so a Git-based Vercel build does NOT
-- bundle the paid zip. /api/download therefore streams it from a PRIVATE
-- Storage bucket, using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (the service
-- role bypasses Storage RLS; the signed token + paid-order row in the route
-- are the only gate). Bucket name must match DELIVERABLE_BUCKET (default
-- `clientflow-deliverables`).
--
-- Create + upload with the bundled script (reads .env.local):
--     npm run upload:deliverable
--
-- Confirm both the tables and the bucket/object with:
--     npm run health
--
-- Storage bucket SQL equivalent (run in the SQL editor; the script does this
-- via the Storage API automatically):
--     insert into storage.buckets (id, name, public)
--     values ('clientflow-deliverables', 'clientflow-deliverables', false)
--     on conflict (id) do nothing;
