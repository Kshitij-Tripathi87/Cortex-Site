/* Shared security state. Production uses Supabase; development may use memory. */

import { getSupabaseAdmin } from "./supabase";

export type AdminSessionRecord = { sessionId: string; expiresAt: number; ip: string; userAgent: string };
export type LoginAttemptState = { count: number; firstAttemptAt: number; lockedUntil: number };
export type RateLimitBucket = { count: number; resetAt: number; allowed?: boolean };

const localSessions = new Map<string, AdminSessionRecord>();
const localLoginAttempts = new Map<string, LoginAttemptState>();
const localBuckets = new Map<string, RateLimitBucket>();

export async function createSession(sessionId: string, expiresAt: number, ip: string, userAgent: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    localSessions.set(sessionId, { sessionId, expiresAt, ip, userAgent });
    return;
  }
  const { error } = await supabase.from("admin_sessions").insert({ session_id: sessionId, expires_at: new Date(expiresAt).toISOString(), ip, user_agent: userAgent });
  if (error) throw new Error(`security session create failed: ${error.message}`);
}

export async function readSession(sessionId: string): Promise<AdminSessionRecord | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return localSessions.get(sessionId) ?? null;
  const { data, error } = await supabase.from("admin_sessions").select("session_id, expires_at, ip, user_agent").eq("session_id", sessionId).maybeSingle();
  if (error) throw new Error(`security session read failed: ${error.message}`);
  if (!data) return null;
  return { sessionId: data.session_id, expiresAt: new Date(data.expires_at).getTime(), ip: data.ip ?? "", userAgent: data.user_agent ?? "" };
}

export async function updateSessionExpiry(sessionId: string, expiresAt: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const session = localSessions.get(sessionId);
    if (session) session.expiresAt = expiresAt;
    return;
  }
  const { error } = await supabase.from("admin_sessions").update({ expires_at: new Date(expiresAt).toISOString() }).eq("session_id", sessionId);
  if (error) throw new Error(`security session update failed: ${error.message}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) { localSessions.delete(sessionId); return; }
  const { error } = await supabase.from("admin_sessions").delete().eq("session_id", sessionId);
  if (error) throw new Error(`security session delete failed: ${error.message}`);
}

export async function pruneExpiredSessions(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const now = Date.now();
    for (const [id, session] of localSessions) if (session.expiresAt <= now) localSessions.delete(id);
    return;
  }
  const { error } = await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString());
  if (error) throw new Error(`security session prune failed: ${error.message}`);
}

export async function readLoginAttempts(ip: string): Promise<LoginAttemptState | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return localLoginAttempts.get(ip) ?? null;
  const { data, error } = await supabase.from("admin_login_attempts").select("count, first_attempt_at, locked_until").eq("ip", ip).maybeSingle();
  if (error) throw new Error(`login attempt read failed: ${error.message}`);
  if (!data) return null;
  return { count: Number(data.count), firstAttemptAt: new Date(data.first_attempt_at).getTime(), lockedUntil: new Date(data.locked_until).getTime() };
}

export async function writeLoginAttempts(ip: string, state: LoginAttemptState): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) { localLoginAttempts.set(ip, state); return; }
  const { error } = await supabase.from("admin_login_attempts").upsert({ ip, count: state.count, first_attempt_at: new Date(state.firstAttemptAt).toISOString(), locked_until: new Date(state.lockedUntil).toISOString() }, { onConflict: "ip" });
  if (error) throw new Error(`login attempt write failed: ${error.message}`);
}

export async function recordFailedLogin(ip: string, maxAttempts: number, windowMs: number, lockoutMs: number): Promise<LoginAttemptState> {
  const supabase = getSupabaseAdmin();
  const now = Date.now();
  if (!supabase) {
    const existing = localLoginAttempts.get(ip);
    const state = !existing || now - existing.firstAttemptAt > windowMs ? { count: 1, firstAttemptAt: now, lockedUntil: 0 } : { ...existing, count: Math.min(existing.count + 1, maxAttempts) };
    if (state.count >= maxAttempts) state.lockedUntil = now + lockoutMs;
    localLoginAttempts.set(ip, state);
    return state;
  }
  const { data, error } = await supabase.rpc("record_failed_login", { p_ip: ip, p_max_attempts: maxAttempts, p_window_ms: windowMs, p_lockout_ms: lockoutMs });
  if (error || !data) throw new Error(`login attempt update failed: ${error?.message ?? "no result"}`);
  const row = Array.isArray(data) ? data[0] : data;
  return { count: Number(row.count), firstAttemptAt: new Date(row.first_attempt_at).getTime(), lockedUntil: new Date(row.locked_until).getTime() };
}

export async function deleteLoginAttempts(ip: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) { localLoginAttempts.delete(ip); return; }
  const { error } = await supabase.from("admin_login_attempts").delete().eq("ip", ip);
  if (error) throw new Error(`login attempt delete failed: ${error.message}`);
}

export async function pruneLoginAttempts(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const now = Date.now();
    for (const [ip, state] of localLoginAttempts) if (state.lockedUntil <= now && state.firstAttemptAt + 10 * 60 * 1000 <= now) localLoginAttempts.delete(ip);
    return;
  }
  const { error } = await supabase.from("admin_login_attempts").delete().lt("locked_until", new Date(Date.now() - 30 * 60 * 1000).toISOString());
  if (error) throw new Error(`login attempt prune failed: ${error.message}`);
}

export async function consumeRateLimitBucket(key: string, max: number, windowMs: number): Promise<RateLimitBucket> {
  const supabase = getSupabaseAdmin();
  const now = Date.now();
  if (!supabase) {
    const current = localBuckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 1, resetAt: now + windowMs, allowed: true } : current.count >= max ? { ...current, allowed: false } : { ...current, count: current.count + 1, allowed: true };
    localBuckets.set(key, bucket);
    return bucket;
  }
  const { data, error } = await supabase.rpc("consume_rate_limit", { p_bucket_key: key, p_max_requests: max, p_window_ms: windowMs });
  if (error || !data) throw new Error(`rate limit update failed: ${error?.message ?? "no result"}`);
  const row = Array.isArray(data) ? data[0] : data;
  return { count: Number(row.count), resetAt: new Date(row.reset_at).getTime(), allowed: Boolean(row.allowed) };
}

export async function pruneRateLimitBuckets(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const now = Date.now();
    for (const [key, bucket] of localBuckets) if (bucket.resetAt <= now) localBuckets.delete(key);
    return;
  }
  const { error } = await supabase.from("rate_limit_buckets").delete().lt("reset_at", new Date().toISOString());
  if (error) throw new Error(`rate limit prune failed: ${error.message}`);
}

export function isDistributedRateLimiting(): boolean { return getSupabaseAdmin() !== null; }
