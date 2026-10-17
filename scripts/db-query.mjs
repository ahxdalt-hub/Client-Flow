#!/usr/bin/env node
/**
 * Run arbitrary SQL against your Supabase project (Management API).
 *
 *   node scripts/db-query.mjs "select count(*) from public.orders"
 *   node scripts/db-query.mjs --file scripts/foo.sql
 *
 * Read-only by convention; it will happily run whatever you give it. Needs the
 * one-off SUPABASE_ACCESS_TOKEN in .env.local (see .env.example). Prints rows
 * as JSON, or `(no rows)`.
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
const [, , first, second] = process.argv;

let sql;
if (first === "--file") {
  if (!second) {
    console.error("Usage: node scripts/db-query.mjs --file <path.sql>");
    process.exit(1);
  }
  sql = fs.readFileSync(path.resolve(root, second), "utf8");
} else {
  sql = first;
}

if (!token || !url || !sql) {
  console.error("Need SUPABASE_URL + SUPABASE_ACCESS_TOKEN in .env.local, and a SQL string/file.");
  process.exit(1);
}

const ref = new URL(url).hostname.split(".")[0];
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`Query failed: HTTP ${res.status}\n${text}`);
  process.exit(1);
}
try {
  const rows = JSON.parse(text);
  console.log(Array.isArray(rows) && rows.length ? JSON.stringify(rows, null, 2) : "(no rows)");
} catch {
  console.log(text);
}
