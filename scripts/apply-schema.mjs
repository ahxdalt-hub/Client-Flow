#!/usr/bin/env node
/**
 * Apply supabase/schema.sql to your Supabase project in one command.
 *
 *   node scripts/apply-schema.mjs      (or: npm run db:apply)
 *
 * Creates the first-party tables (analytics_events, download_log) and the
 * order-lookup indexes the app needs. Idempotent — safe to re-run.
 *
 * Needs SUPABASE_ACCESS_TOKEN — a *personal access token* from
 * https://supabase.com/dashboard/account/tokens — in .env.local or the env.
 * The project ref is read from SUPABASE_URL. Uses the Management API's
 * database/query endpoint, so no Postgres client is required.
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
if (!token) {
  console.error(
    "Missing SUPABASE_ACCESS_TOKEN. Create one at\n" +
      "  https://supabase.com/dashboard/account/tokens\n" +
      "and add it to .env.local as SUPABASE_ACCESS_TOKEN=sbp_...",
  );
  process.exit(1);
}
if (!url) {
  console.error("Missing SUPABASE_URL in .env.local.");
  process.exit(1);
}

let ref;
try {
  ref = new URL(url).hostname.split(".")[0];
} catch {
  console.error(`SUPABASE_URL is not a valid URL: ${url}`);
  process.exit(1);
}

const sql = fs.readFileSync(path.join(root, "supabase", "schema.sql"), "utf8");
console.log(`Applying supabase/schema.sql to project "${ref}"…`);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  },
);

const text = await res.text();
if (!res.ok) {
  console.error(`Apply failed: HTTP ${res.status}\n${text}`);
  process.exit(1);
}

console.log("Done. Verify with: npm run health");
