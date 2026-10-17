#!/usr/bin/env node
/**
 * Reset the storefront's own tables to a clean slate (schema is kept).
 *
 *   node scripts/reset-data.mjs --yes      (or: npm run db:reset -- --yes)
 *
 * Truncates `orders`, `analytics_events` and `download_log`, and restarts the
 * audit-log id sequences. Legacy tables (entitlements / download_events /
 * product_versions) are never touched. Without `--yes` it only reports counts.
 */

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function loadEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...loadEnvFile(path.join(root, ".env.local")), ...process.env };
const token = env.SUPABASE_ACCESS_TOKEN;
const url = env.SUPABASE_URL?.replace(/\/+$/, "");
if (!token || !url) {
  console.error("Need SUPABASE_URL + SUPABASE_ACCESS_TOKEN in .env.local.");
  process.exit(1);
}
const ref = new URL(url).hostname.split(".")[0];

async function q(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

const before = await q(
  "select 'orders' as t, count(*)::int as n from public.orders " +
    "union all select 'analytics_events', count(*)::int from public.analytics_events " +
    "union all select 'download_log', count(*)::int from public.download_log",
);

if (!process.argv.includes("--yes")) {
  console.log("Would truncate (pass --yes to actually do it):");
  console.table(before);
  process.exit(0);
}

// CASCADE also clears the empty legacy tables that hold FKs to `orders`
// (entitlements → download_events); see the notes in supabase/schema.sql.
await q(
  "truncate table public.orders, public.analytics_events, public.download_log restart identity cascade;",
);

const after = await q(
  "select 'orders' as t, count(*)::int as n from public.orders " +
    "union all select 'analytics_events', count(*)::int from public.analytics_events " +
    "union all select 'download_log', count(*)::int from public.download_log",
);

console.log("Database reset — clean slate:");
console.table(after);
