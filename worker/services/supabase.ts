/**
 * Supabase persistence client for the Cortex Worker.
 * Uses the PostgREST interface via fetch — no SDK dependency at the edge.
 * Supabase is authoritative for demo/contact/waitlist requests.
 */

export type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

export type SupabaseResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(
  config: SupabaseConfig,
  table: string,
  init: RequestInit & { searchParams?: Record<string, string> },
): Promise<SupabaseResult<T>> {
  try {
    const url = new URL(`${config.url.replace(/\/+$/, "")}/rest/v1/${table}`);
    if (init.searchParams) {
      for (const [key, value] of Object.entries(init.searchParams)) {
        url.searchParams.set(key, value);
      }
    }

    const { searchParams: _sp, ...fetchInit } = init;
    const response = await fetch(url.toString(), {
      ...fetchInit,
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...init.headers,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[supabase] ${table} request failed (${response.status}):`, errText);
      return { ok: false, error: "persistence_failed" };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];
    return { ok: true, data: data as T };
  } catch (err) {
    console.error(`[supabase] ${table} network error:`, err);
    return { ok: false, error: "persistence_network_error" };
  }
}

export function insertRow<T extends Record<string, unknown>>(
  config: SupabaseConfig,
  table: string,
  row: T,
): Promise<SupabaseResult<T[]>> {
  return request<T[]>(config, table, {
    method: "POST",
    body: JSON.stringify(row),
  });
}

export function selectRows<T = unknown>(
  config: SupabaseConfig,
  table: string,
  searchParams: Record<string, string> = {},
): Promise<SupabaseResult<T[]>> {
  return request<T[]>(config, table, { method: "GET", searchParams });
}

export const TABLES = {
  contactRequests: "contact_requests",
  waitlistSignups: "waitlist_signups",
} as const;
