-- Marketloom: payment orders, download entitlements, and download audit.
-- Apply with the Supabase SQL editor or `supabase db push`.
--
-- Access model: RLS is enabled with NO policies, so only the service-role
-- key (server-side) can read or write these tables. Never publish the
-- service-role key.

create extension if not exists pgcrypto;

-- One row per checkout attempt / payment. `provider_payment_id` is unique so
-- the same payment can never be recorded (or fulfilled) twice.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay',
  provider_order_id text not null,
  provider_payment_id text unique,
  product_id text not null,
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

-- Exactly one entitlement per order. Created only from server-side payment
-- verification (webhook or /api/verify) — never from a client claim.
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique
    references public.orders (id) on delete cascade,
  product_id text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- Minimal download audit: when signed links were issued for an entitlement.
-- No customer PII is stored here.
create table if not exists public.download_events (
  id bigint generated always as identity primary key,
  entitlement_id uuid not null
    references public.entitlements (id) on delete cascade,
  kind text not null check (kind in ('link_issued')),
  created_at timestamptz not null default now()
);

create index if not exists orders_order_id_idx
  on public.orders (provider, provider_order_id);

create index if not exists download_events_rate_idx
  on public.download_events (entitlement_id, kind, created_at desc);

alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.download_events enable row level security;

-- Deliberately no policies: anon/authenticated roles have zero access.
-- All access goes through the service-role key on the server.
