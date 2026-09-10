/* Supabase Auth integration for the private Cortex admin surface. */

import { getSupabaseAdmin } from "./supabase";

export type AuthenticatedAdmin = { userId: string; email: string };

export async function loginWithSupabaseAuth(email: string, password: string): Promise<AuthenticatedAdmin | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase_auth_not_configured");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("auth_user_id, disabled")
    .eq("auth_user_id", data.user.id)
    .eq("disabled", false)
    .maybeSingle();

  if (adminError) {
    console.error("[auth] Admin identity lookup failed:", adminError.message);
    throw new Error("admin_identity_lookup_failed");
  }
  if (!admin) return null;

  return { userId: data.user.id, email: data.user.email ?? email };
}

export async function verifySupabaseToken(accessToken: string): Promise<AuthenticatedAdmin | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData.user) return null;
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("auth_user_id, disabled")
      .eq("auth_user_id", userData.user.id)
      .eq("disabled", false)
      .maybeSingle();
    if (adminError || !admin) return null;
    return { userId: userData.user.id, email: userData.user.email ?? "" };
  } catch (error) {
    console.error("[auth] Failed to verify Supabase token:", error);
    return null;
  }
}

export function isSupabaseAuthEnabled(): boolean {
  return getSupabaseAdmin() !== null;
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}
