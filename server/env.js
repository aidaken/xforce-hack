import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnv(path) {
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
const loaded = {
  ...parseEnv(resolve(root, ".env.example")),
  ...parseEnv(resolve(root, ".env")),
  ...process.env,
};

for (const [key, value] of Object.entries(loaded)) {
  if (process.env[key] == null) process.env[key] = value;
}

export const env = {
  port: Number(process.env.PORT || 3000),
  openrouterKey: process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  openrouterUrl:
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  siteUrl: process.env.SITE_URL || "https://xforce-hack.vercel.app",
};

export function llmReady() {
  return Boolean(env.openrouterKey);
}
