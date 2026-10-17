import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const raw = fs.readFileSync(".env.local", "utf8");
const get = (k) => raw.match(new RegExp(k + '="([^"]+)"'))?.[1];
const db = createClient(get("SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"));

const { data, error } = await db.from("orders").select("*").order("created_at", { ascending: false }).limit(6);
if (error) console.log("error:", error.message);
else for (const o of data) console.log(`${o.provider_order_id}  status=${o.status}  amount=${o.amount_paise}  paid_at=${o.paid_at ?? "-"}`);
