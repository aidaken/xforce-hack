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

function unquote(value) {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

/** Minimal TOML reader for secrets.toml ([section] key = "value"). */
function parseSecretsToml(path) {
  if (!existsSync(path)) return {};
  const mapped = {};
  let section = "";
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const header = trimmed.match(/^\[([^\]]+)\]$/);
    if (header) {
      section = header[1].trim();
      continue;
    }
    const kv = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!kv) continue;
    const key = section ? `${section}.${kv[1]}` : kv[1];
    mapped[key] = unquote(kv[2]);
  }
  const out = {};
  if (mapped["openrouter.api_key"]) out.OPENROUTER_API_KEY = mapped["openrouter.api_key"];
  if (mapped["openrouter.model"]) out.OPENROUTER_MODEL = mapped["openrouter.model"];
  if (mapped["openrouter.base_url"]) out.OPENROUTER_BASE_URL = mapped["openrouter.base_url"];
  return out;
}

const root = resolve(import.meta.dirname, "..");
const loaded = {
  ...parseEnv(resolve(root, ".env.example")),
  ...parseSecretsToml(resolve(root, "secrets.toml")),
  ...parseEnv(resolve(root, ".env")),
  ...process.env,
};

for (const [key, value] of Object.entries(loaded)) {
  if (process.env[key] == null) process.env[key] = value;
}

export const env = {
  port: Number(process.env.PORT || 3000),
  openrouterKey: process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash",
  openrouterUrl:
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  siteUrl: process.env.SITE_URL || "https://xforce-hack.vercel.app",
};

export function llmReady() {
  return Boolean(env.openrouterKey);
}
