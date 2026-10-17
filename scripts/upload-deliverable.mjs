#!/usr/bin/env node
/**
 * Upload the paid deliverable zip to the private Supabase Storage bucket so
 * /api/download can serve it on deployments that do not bundle the file
 * (`assets/deliverables/` is gitignored, so Vercel builds don't include it).
 *
 *   node scripts/upload-deliverable.mjs      (or: npm run upload:deliverable)
 *
 * Reads .env.local, creates the bucket if missing, then upserts the object.
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

const url = env.SUPABASE_URL?.replace(/\/+$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = env.DELIVERABLE_BUCKET || "clientflow-deliverables";
const fileName = "clientflow-outreach-kit.zip";
const filePath = path.join(root, "assets", "deliverables", fileName);

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).");
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error(`Missing ${path.relative(root, filePath)} — build the product first.`);
  process.exit(1);
}

const bytes = fs.readFileSync(filePath);
const headers = { apikey: key, Authorization: `Bearer ${key}` };

// Create the private bucket (idempotent: 400/409 means it already exists).
let res = await fetch(`${url}/storage/v1/bucket`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ id: bucket, name: bucket, public: false }),
});
if (res.ok) {
  console.log(`Created private bucket "${bucket}".`);
} else if (res.status === 400 || res.status === 409) {
  console.log(`Bucket "${bucket}" already exists.`);
} else {
  console.error(`Bucket create failed: HTTP ${res.status} ${await res.text()}`);
  process.exit(1);
}

// Upsert the object.
res = await fetch(`${url}/storage/v1/object/${bucket}/${fileName}`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/zip", "x-upsert": "true" },
  body: bytes,
});
if (!res.ok) {
  console.error(`Upload failed: HTTP ${res.status} ${await res.text()}`);
  process.exit(1);
}

console.log(
  `Uploaded ${fileName} (${(bytes.length / 1024 / 1024).toFixed(2)} MB) to "${bucket}".`,
);
