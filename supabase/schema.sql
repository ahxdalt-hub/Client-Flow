-- ClientFlow Outreach Kit — Supabase notes
--
-- CURRENT DEPLOYMENT (existing database)
-- This Supabase project already contains the previous application's tables.
-- The app is adapted to the existing `orders` schema as-is:
--
--   orders: id uuid PK (we generate crypto.randomUUID),
--           provider text ('razorpay'), provider_order_id text,
--           provider_payment_id text, product_id text,
--           status text CHECK IN ('created','paid','failed'),
--           amount_paise bigint, currency text, created_at/paid_at/updated_at timestamptz
--
-- Notes on this adaptation:
--   * There is no unique constraint on provider_order_id, so the app
--     inserts one row per checkout attempt and marks the newest row paid.
--   * The status CHECK constraint only allows created | paid | failed,
--     which is why "created" is written for unpaid intents.
--   * Buyer contact data is intentionally NOT stored in this table;
--     Razorpay retains name/email/contact on the payment and is used for
--     receipt email — the DB never holds personal data.
--   * `analytics_events` does not exist here; events are logged to the
--     server console until the table below is created.
--
-- ── Clean rebuild (fresh database) ──────────────────────────────────
-- Run this section to create the optional first-party tables.

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
create table if not exists public.download_log (
  id           bigserial primary key,
  order_id     text,        -- Razorpay order id
  ip_hash      text,        -- salted, truncated hash — raw IPs never stored
  created_at   timestamptz not null default now()
);

alter table public.download_log enable row level security;
-- No policies — server writes via service role.

-- After creating analytics_events / download_log, the helpers in
-- src/lib/orders.ts (logEvent / logDownload) pick the tables up
-- automatically — no code change needed.
