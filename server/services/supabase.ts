/* Service-role Supabase client. This module is server-only. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;
let initializationError: Error | null = null;

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

/**
 * Returns the service-role client when configured.
 * In production, invalid/missing configuration is an application failure;
 * local JSON/security fallbacks are intentionally available only in dev.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) {
    if (initializationError && process.env.NODE_ENV === "production") throw initializationError;
    return client;
  }

  const url = readEnv("SUPABASE_URL");
  const serviceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    client = null;
    initializationError = new Error("Supabase is not configured.");
    if (process.env.NODE_ENV === "production") throw initializationError;
    return client;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error(`Invalid SUPABASE_URL protocol: ${parsed.protocol}`);
    }
    client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "X-Client-Info": "cortex-marketing-server" } },
    });
    initializationError = null;
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    client = null;
    console.error("[supabase] Failed to initialize client:", initializationError.message);
    if (process.env.NODE_ENV === "production") throw initializationError;
  }
  return client;
}

export function isSupabaseEnabled(): boolean {
  return getSupabaseAdmin() !== null;
}

/** Test-only hook to reset the memoized client. */
export function __resetSupabaseClientForTests(): void {
  client = undefined;
  initializationError = null;
}
