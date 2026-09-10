/*
 * Issue #6: Distributed security state.
 *
 * Provides Supabase-backed storage for admin sessions, login attempts,
 * and rate limit buckets. Falls back to in-memory Maps when Supabase
 * is not configured (development mode).
 *
 * In production on Render, this ensures sessions and rate limits survive
 * process restarts and are shared across instances.
 */

import { getSupabaseAdmin } from "./supabase";

/* ------------------------------------------------------------------ */
/* Admin sessions                                                       */
/* ------------------------------------------------------------------ */

export type AdminSessionRecord = {
  sessionId: string;
  expiresAt: number;
  ip: string;
  userAgent: string;
};

const localSessions = new Map<string, AdminSessionRecord>();

export async function createSession(sessionId: string, expiresAt: number, ip: string, userAgent: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("admin_sessions").insert({
      session_id: sessionId,
      expires_at: new Date(expiresAt).toISOString(),
      ip,
      user_agent: userAgent,
    });
    if (error) console.error("[securityStore] Failed to create session:", error.message);
    return;
  }
  localSessions.set(sessionId, { sessionId, expiresAt, ip, userAgent });
}

export async function readSession(sessionId: string): Promise<AdminSessionRecord | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("admin_sessions")
      .select("session_id, expires_at, ip, user_agent")
      .eq("session_id", sessionId)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      sessionId: data.session_id,
      expiresAt: new Date(data.expires_at).getTime(),
      ip: data.ip ?? "",
      userAgent: data.user_agent ?? "",
    };
  }
  return localSessions.get(sessionId) ?? null;
}

export async function updateSessionExpiry(sessionId: string, expiresAt: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("admin_sessions")
      .update({ expires_at: new Date(expiresAt).toISOString() })
      .eq("session_id", sessionId);
    if (error) console.error("[securityStore] Failed to update session expiry:", error.message);
    return;
  }
  const session = localSessions.get(sessionId);
  if (session) session.expiresAt = expiresAt;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("admin_sessions").delete().eq("session_id", sessionId);
    if (error) console.error("[securityStore] Failed to delete session:", error.message);
    return;
  }
  localSessions.delete(sessionId);
}

export async function pruneExpiredSessions(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("admin_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString());
    if (error) console.error("[securityStore] Failed to prune sessions:", error.message);
    return;
  }
  const now = Date.now();
  localSessions.forEach((session, id) => {
    if (session.expiresAt <= now) localSessions.delete(id);
  });
}

/* ------------------------------------------------------------------ */
/* Login attempts                                                      */
/* ------------------------------------------------------------------ */

export type LoginAttemptState = {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number;
};

const localLoginAttempts = new Map<string, LoginAttemptState>();

export async function readLoginAttempts(ip: string): Promise<LoginAttemptState | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("admin_login_attempts")
      .select("count, first_attempt_at, locked_until")
      .eq("ip", ip)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      count: data.count,
      firstAttemptAt: new Date(data.first_attempt_at).getTime(),
      lockedUntil: new Date(data.locked_until).getTime(),
    };
  }
  return localLoginAttempts.get(ip) ?? null;
}

export async function writeLoginAttempts(ip: string, state: LoginAttemptState): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("admin_login_attempts").upsert({
      ip,
      count: state.count,
      first_attempt_at: new Date(state.firstAttemptAt).toISOString(),
      locked_until: new Date(state.lockedUntil).toISOString(),
    }, { onConflict: "ip" });
    if (error) console.error("[securityStore] Failed to write login attempts:", error.message);
    return;
  }
  localLoginAttempts.set(ip, state);
}

export async function deleteLoginAttempts(ip: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("admin_login_attempts").delete().eq("ip", ip);
    if (error) console.error("[securityStore] Failed to delete login attempts:", error.message);
    return;
  }
  localLoginAttempts.delete(ip);
}

export async function pruneLoginAttempts(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("admin_login_attempts")
      .delete()
      .lt("locked_until", new Date(Date.now() - 30 * 60 * 1000).toISOString());
    if (error) console.error("[securityStore] Failed to prune login attempts:", error.message);
    return;
  }
  const now = Date.now();
  localLoginAttempts.forEach((state, ip) => {
    if (state.lockedUntil <= now && state.firstAttemptAt + 10 * 60 * 1000 <= now) {
      localLoginAttempts.delete(ip);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Rate limit buckets (distributed option)                             */
/* ------------------------------------------------------------------ */

export type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const localBuckets = new Map<string, RateLimitBucket>();

export async function getRateLimitBucket(key: string): Promise<RateLimitBucket | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("rate_limit_buckets")
      .select("count, reset_at")
      .eq("bucket_key", key)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      count: data.count,
      resetAt: new Date(data.reset_at).getTime(),
    };
  }
  return localBuckets.get(key) ?? null;
}

export async function setRateLimitBucket(key: string, bucket: RateLimitBucket): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("rate_limit_buckets").upsert({
      bucket_key: key,
      count: bucket.count,
      reset_at: new Date(bucket.resetAt).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "bucket_key" });
    if (error) console.error("[securityStore] Failed to set rate limit bucket:", error.message);
    return;
  }
  localBuckets.set(key, bucket);
}

export async function incrementRateLimitBucket(key: string): Promise<RateLimitBucket | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.rpc("increment_rate_limit", { bucket_key: key });
    if (error) {
      // Fallback: read, increment, write
      const existing = await getRateLimitBucket(key);
      if (existing) {
        existing.count += 1;
        await setRateLimitBucket(key, existing);
        return existing;
      }
      return null;
    }
    return data as RateLimitBucket;
  }
  const local = localBuckets.get(key);
  if (local) {
    local.count += 1;
    return local;
  }
  return null;
}

export async function pruneRateLimitBuckets(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("rate_limit_buckets")
      .delete()
      .lt("reset_at", new Date().toISOString());
    if (error) console.error("[securityStore] Failed to prune rate limit buckets:", error.message);
    return;
  }
  const now = Date.now();
  localBuckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) localBuckets.delete(key);
  });
}

/**
 * Check if rate limiting is distributed (Supabase-backed).
 * Used by the rate limiter to decide between sync and async paths.
 */
export function isDistributedRateLimiting(): boolean {
  return getSupabaseAdmin() !== null;
}
