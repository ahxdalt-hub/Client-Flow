import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPaymentsEnv } from "@/lib/server/env";

export type OrderRow = {
  id: string;
  provider: string;
  provider_order_id: string;
  provider_payment_id: string | null;
  product_id: string;
  status: "created" | "paid" | "failed" | "refunded";
  amount_paise: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
};

export type EntitlementRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_version_id: string | null;
  granted_at: string;
  revoked_at: string | null;
};

export type DownloadEventRow = {
  id: number;
  entitlement_id: string;
  kind: "link_issued";
  created_at: string;
};

let adminClient: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Bypasses RLS — server-only, never import
 * this from client components. Returns null while unconfigured so callers
 * can answer 503 honestly.
 */
export function getAdminClient(): SupabaseClient | null {
  if (adminClient) return adminClient;
  const parsed = getPaymentsEnv();
  if (!parsed.ok) return null;
  adminClient = createClient(parsed.env.supabaseUrl, parsed.env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return adminClient;
}

/**
 * Test-only override for the service-role client (used by the in-memory fake
 * in `src/test-support`). Never call this from application code.
 */
export function __setAdminClientForTests(client: SupabaseClient | null): void {
  adminClient = client;
}
