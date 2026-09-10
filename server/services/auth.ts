/*
 * Issue #7: Migrate admin auth to Supabase Auth.
 *
 * Provides Supabase Auth integration for admin access:
 * - Verifies Supabase JWTs from the Authorization header
 * - Checks if the authenticated user has admin privileges
 * - Supports email/password login via Supabase Auth
 *
 * The legacy shared token (WORKFLO_ADMIN_TOKEN) remains as a fallback
 * for development and backward compatibility.
 */

import { getSupabaseAdmin } from "./supabase";

export type AuthenticatedAdmin = {
  userId: string;
  email: string;
  authMethod: "supabase" | "legacy_token";
};

/**
 * Verify a Supabase access token from the Authorization header.
 * Returns the user info if the token is valid and the user is an admin.
 */
export async function verifySupabaseToken(accessToken: string): Promise<AuthenticatedAdmin | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    // Get the user from the access token
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData.user) return null;

    const userId = userData.user.id;
    const email = userData.user.email ?? "";

    // Check if this user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("id, auth_user_id")
      .eq("auth_user_id", userId)
      .limit(1)
      .maybeSingle();

    if (adminError || !adminData) return null;

    return {
      userId,
      email,
      authMethod: "supabase",
    };
  } catch (error) {
    console.error("[auth] Failed to verify Supabase token:", error);
    return null;
  }
}

/**
 * Authenticate with email and password via Supabase Auth.
 * Returns the access token and user info on success.
 */
export async function loginWithSupabaseAuth(email: string, password: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedAdmin;
} | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) return null;

    // Verify the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("id, auth_user_id")
      .eq("auth_user_id", data.user.id)
      .limit(1)
      .maybeSingle();

    if (adminError || !adminData) return null;

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        userId: data.user.id,
        email: data.user.email ?? "",
        authMethod: "supabase",
      },
    };
  } catch (error) {
    console.error("[auth] Supabase Auth login failed:", error);
    return null;
  }
}

/**
 * Check if Supabase Auth is available for admin login.
 */
export function isSupabaseAuthEnabled(): boolean {
  return getSupabaseAdmin() !== null;
}

/**
 * Extract the Bearer token from an Authorization header.
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
