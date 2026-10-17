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

-- After these tables exist, the helpers in src/lib/orders.ts
-- (logEvent / logDownload) pick them up automatically — no code change.
