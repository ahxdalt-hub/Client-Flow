-- Marketloom: product versions pinned to entitlements.
-- Apply after 20261014000001_orders_entitlements.sql.
--
-- Why: every entitlement resolves to exactly one product version, and version
-- files live at versioned storage paths (`marketloom/v1/…`) so a new dataset
-- revision never changes what an existing customer already bought.
--
-- Fulfillment state remains explicit and minimal:
--   * orders.status        — payment state (created/paid/failed/refunded)
--   * entitlements.granted_at / revoked_at — fulfillment + revocation
-- This migration only adds the version pin those entitlements point at.
--
-- Access model: RLS enabled with NO policies — service-role key only.

create table if not exists public.product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  version text not null,
  csv_path text not null,
  xlsx_path text not null,
  record_count integer check (record_count is null or record_count >= 0),
  is_current boolean not null default false,
  released_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (product_id, version)
);

-- Enforced "one current version per product", not just a convention.
create unique index if not exists product_versions_one_current_idx
  on public.product_versions (product_id)
  where is_current;

-- Entitlements pin the version the customer paid for.
alter table public.entitlements
  add column if not exists product_version_id uuid
    references public.product_versions (id);

create index if not exists entitlements_version_idx
  on public.entitlements (product_version_id);

alter table public.product_versions enable row level security;
