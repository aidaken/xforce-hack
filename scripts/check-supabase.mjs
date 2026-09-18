#!/usr/bin/env node
/**
 * Ping the shared hosted Supabase (tfmzjvoqsktlzwnrzdzr).
 * Usage: node scripts/check-supabase.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    out[trimmed.slice(0, i)] = trimmed.slice(i + 1).trim();
  }
  return out;
}

const root = resolve(import.meta.dirname, "..");
const env = {
  ...loadEnv(resolve(root, ".env.example")),
  ...loadEnv(resolve(root, ".env")),
  ...process.env,
};

const url = env.SUPABASE_URL;
const key = env.SUPABASE_ANON_KEY;
const ref = env.SUPABASE_PROJECT_REF || "tfmzjvoqsktlzwnrzdzr";

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Copy .env.example to .env.");
  process.exit(1);
}

const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

if (!res.ok) {
  console.error(`Supabase check failed (${res.status}) for ${url} (ref ${ref})`);
  console.error(await res.text());
  process.exit(1);
}

const body = await res.json().catch(() => ({}));
console.log(`OK  ${url}  ref=${ref}  status=${res.status}  auth=${body.name || "ok"}`);
console.log("Dashboard: https://supabase.com/dashboard/project/tfmzjvoqsktlzwnrzdzr");
