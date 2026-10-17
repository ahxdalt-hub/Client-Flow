#!/usr/bin/env node
/**
 * Backend healthcheck — verifies every external dependency the storefront
 * needs, without ever printing a secret value.
 *
 *   node scripts/healthcheck.mjs      (or: npm run health)
 *
 * Loads .env.local when present, then checks:
 *   - required env vars
 *   - Supabase: orders / analytics_events / download_log tables
 *   - Supabase Storage: the private deliverable bucket + the paid zip object
 *   - Razorpay: the API keys authenticate
 *
 * Every check is read-only. Exit code is non-zero if any required check fails.
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

const results = [];
const pass = (name, detail = "") => results.push({ level: "PASS", name, detail });
const warn = (name, detail = "") => results.push({ level: "WARN", name, detail });
const fail = (name, detail = "") => results.push({ level: "FAIL", name, detail });

const url = env.SUPABASE_URL?.replace(/\/+$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const keyId = env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const bucket = env.DELIVERABLE_BUCKET || "clientflow-deliverables";
const deliverable = "clientflow-outreach-kit.zip";

// ── 1. env presence ──────────────────────────────────────────────────
for (const name of [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DOWNLOAD_TOKEN_SECRET",
  "RAZORPAY_KEY_SECRET",
]) {
  if (env[name]) pass(`env ${name}`);
  else fail(`env ${name}`, "missing");
}
if (keyId) pass("env RAZORPAY_KEY_ID (or NEXT_PUBLIC_ fallback)");
else fail("env RAZORPAY_KEY_ID", "missing");

// ── 2/3. Supabase ────────────────────────────────────────────────────
if (url && key) {
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  for (const table of ["orders", "analytics_events", "download_log"]) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
      if (res.ok) {
        pass(`supabase table ${table}`);
      } else {
        const body = await res.text();
        if (res.status === 404 || /does not exist|Could not find the table|schema cache/i.test(body)) {
          warn(`supabase table ${table}`, "not created — run supabase/schema.sql");
        } else {
          fail(`supabase table ${table}`, `HTTP ${res.status}`);
        }
      }
    } catch (error) {
      fail(`supabase table ${table}`, error.message);
    }
  }

  try {
    const res = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers });
    if (!res.ok) {
      fail(`storage bucket ${bucket}`, `HTTP ${res.status} — create it via npm run upload:deliverable`);
    } else {
      pass(`storage bucket ${bucket}`);
      const head = await fetch(`${url}/storage/v1/object/${bucket}/${deliverable}`, {
        method: "HEAD",
        headers,
      });
      if (head.ok) pass(`storage object ${deliverable}`);
      else fail(`storage object ${deliverable}`, `HTTP ${head.status} — run npm run upload:deliverable`);
    }
  } catch (error) {
    fail("supabase storage", error.message);
  }
} else {
  warn("supabase", "not configured — orders/recovery/storage checks skipped");
}

// ── 4. Razorpay keys ─────────────────────────────────────────────────
if (keyId && env.RAZORPAY_KEY_SECRET) {
  try {
    const auth = Buffer.from(`${keyId}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (res.ok) pass("razorpay keys authenticate");
    else if (res.status === 401) fail("razorpay keys authenticate", "401 — check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET");
    else warn("razorpay keys authenticate", `HTTP ${res.status}`);
  } catch (error) {
    fail("razorpay keys authenticate", error.message);
  }
} else {
  warn("razorpay", "key id or secret missing — skipped");
}

// ── report ───────────────────────────────────────────────────────────
console.log("");
for (const r of results) {
  const tag = r.level === "PASS" ? "PASS" : r.level === "WARN" ? "WARN" : "FAIL";
  console.log(`[${tag}] ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
}
const failed = results.filter((r) => r.level === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} checks passed${failed ? ` — ${failed} FAILED` : ""}\n`);
process.exit(failed ? 1 : 0);
