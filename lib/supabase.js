import { createClient } from "@supabase/supabase-js";

/**
 * Browser-safe client for the shared xforce-hack project
 * (ref tfmzjvoqsktlzwnrzdzr). See docs/supabase.md.
 *
 * Uses the anon / publishable key only. Never pass service_role here.
 */
export function getSupabase() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env. Project ref tfmzjvoqsktlzwnrzdzr — see docs/supabase.md",
    );
  }

  return createClient(url, key);
}
