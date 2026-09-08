/* Silverline Systems reminder: the service-role key is server property. It bypasses
 * RLS, so it must never be prefixed VITE_, logged, or sent to the browser. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

/**
 * Returns a service-role Supabase client when configured, otherwise null.
 * Null means "Supabase not provisioned yet" — callers must fall back to the
 * local JSON store so the site works with zero configuration.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = readEnv("SUPABASE_URL");
  const serviceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    client = null;
    return client;
  }

  try {
    client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "X-Client-Info": "cortex-marketing-server" } },
    });
  } catch (error) {
    console.error("[supabase] Failed to initialize client:", error);
    client = null;
  }
  return client;
}

export function isSupabaseEnabled(): boolean {
  return getSupabaseAdmin() !== null;
}

/** Test-only hook to reset the memoized client. */
export function __resetSupabaseClientForTests() {
  client = undefined;
}
