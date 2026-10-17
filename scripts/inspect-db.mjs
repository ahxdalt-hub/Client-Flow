import fs from "node:fs";

const raw = fs.readFileSync(".env.local", "utf8");
const get = (k) => raw.match(new RegExp(k + '="([^"]+)"'))?.[1];

const SUP = get("SUPABASE_URL");
const KEY = get("SUPABASE_SERVICE_ROLE_KEY");

const res = await fetch(SUP + "/rest/v1/", {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const spec = await res.json();
for (const [table, def] of Object.entries(spec.definitions ?? {})) {
  console.log(`\n== ${table} ==`);
  for (const [col, colDef] of Object.entries(def.properties ?? {})) {
    console.log(`  ${col}: ${colDef.format ?? colDef.type}`);
  }
}
