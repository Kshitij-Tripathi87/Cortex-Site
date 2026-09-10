/*
 * Issue #7: Migrate admin auth to Supabase Auth.
 *
 * This builds on #6 (distributed security state) and adds:
 * - Supabase Auth login endpoint (/admin/auth/login)
 * - JWT-based admin access via Authorization: Bearer header
 * - Backward-compatible legacy token login (/admin/login)
 * - The requireAdmin gate checks both JWT and session cookie
 *
 * Migration path:
 * 1. Deploy with both endpoints active (backward compatible)
 * 2. Create admin users in Supabase Auth and link to admin_users table
 * 3. Update the admin frontend to use /admin/auth/login
 * 4. Remove the legacy /admin/login endpoint in a future release
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { z } from "zod";
import { AdminLoginSchema, type AdminLoginInput } from "../../shared/schemas";
import { validateBody, validated } from "../middleware/validation";
import {
  listAnalyticsEvents,
  listContactRequests,
  listDemoRequests,
  listNewsletterSignups,
  listWaitlistSignups,
} from "../services/store";
import {
  createSession,
  readSession,
  updateSessionExpiry,
  deleteSession,
  pruneExpiredSessions,
  readLoginAttempts,
  writeLoginAttempts,
  deleteLoginAttempts,
  pruneLoginAttempts,
} from "../services/securityStore";
import {
  verifySupabaseToken,
  loginWithSupabaseAuth,
  isSupabaseAuthEnabled,
  extractBearerToken,
  type AuthenticatedAdmin,
} from "../services/auth";

export const adminRouter = Router();

const isProduction = process.env.NODE_ENV === "production";
const ADMIN_SESSION_COOKIE = "cortex_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

// Schema for Supabase Auth login
const SupabaseLoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1).max(254),
  password: z.string().min(1).max(512),
});

type SupabaseLoginInput = z.infer<typeof SupabaseLoginSchema>;

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }
  return cookies;
}

function setAdminSessionCookie(res: Response, sessionId: string, maxAgeMs: number) {
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (isProduction) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function clearAdminSessionCookie(res: Response) {
  const attributes = [`${ADMIN_SESSION_COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Strict", "Max-Age=0"];
  if (isProduction) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function readAdminSessionId(req: Request): string | undefined {
  return parseCookies(req.get("cookie"))[ADMIN_SESSION_COOKIE];
}

function timingSafeStringsEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

function getClientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

// Prune expired state periodically
const pruneInterval = setInterval(() => {
  void pruneExpiredSessions();
  void pruneLoginAttempts();
}, 15 * 60 * 1000);
pruneInterval.unref();

/* ------------------------------------------------------------------ */
/* Supabase Auth login (new)                                           */
/* ------------------------------------------------------------------ */

adminRouter.post("/admin/auth/login", validateBody(SupabaseLoginSchema), async (req, res) => {
  if (!isSupabaseAuthEnabled()) {
    res.status(503).json({ error: "Supabase Auth is not configured." });
    return;
  }

  const clientKey = getClientKey(req);

  // Check login rate limit
  const attemptState = await readLoginAttempts(clientKey);
  if (attemptState) {
    const now = Date.now();
    if (attemptState.lockedUntil > now) {
      res.setHeader("Retry-After", String(Math.ceil((attemptState.lockedUntil - now) / 1000)));
      res.status(429).json({ error: "Too many attempts. Please try again later." });
      return;
    }
    if (now - attemptState.firstAttemptAt > LOGIN_WINDOW_MS) {
      await deleteLoginAttempts(clientKey);
    }
  }

  const { email, password } = validated<SupabaseLoginInput>(req);
  const result = await loginWithSupabaseAuth(email, password);

  if (!result) {
    // Record failed login
    const now = Date.now();
    const existing = await readLoginAttempts(clientKey);
    if (!existing || now - existing.firstAttemptAt > LOGIN_WINDOW_MS) {
      await writeLoginAttempts(clientKey, { count: 1, firstAttemptAt: now, lockedUntil: 0 });
    } else {
      existing.count += 1;
      if (existing.count >= LOGIN_MAX_ATTEMPTS) {
        existing.lockedUntil = now + LOGIN_LOCKOUT_MS;
      }
      await writeLoginAttempts(clientKey, existing);
    }
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  // Success: clear login attempts
  await deleteLoginAttempts(clientKey);

  // Create a session for the Supabase-authenticated user
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await createSession(sessionId, expiresAt, getClientKey(req), req.get("user-agent") ?? "");
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);

  res.status(200).json({
    ok: true,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: { email: result.user.email },
  });
});

/* ------------------------------------------------------------------ */
/* Legacy token login (backward compatible)                            */
/* ------------------------------------------------------------------ */

adminRouter.post("/admin/login", validateBody(AdminLoginSchema), async (req, res) => {
  const configuredToken = process.env.WORKFLO_ADMIN_TOKEN?.trim();
  if (!configuredToken) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }

  const clientKey = getClientKey(req);

  // Check login rate limit
  const attemptState = await readLoginAttempts(clientKey);
  if (attemptState) {
    const now = Date.now();
    if (attemptState.lockedUntil > now) {
      res.setHeader("Retry-After", String(Math.ceil((attemptState.lockedUntil - now) / 1000)));
      res.status(429).json({ error: "Too many attempts. Please try again later." });
      return;
    }
    if (now - attemptState.firstAttemptAt > LOGIN_WINDOW_MS) {
      await deleteLoginAttempts(clientKey);
    }
  }

  const { token } = validated<AdminLoginInput>(req);
  if (!timingSafeStringsEqual(token, configuredToken)) {
    const now = Date.now();
    const existing = await readLoginAttempts(clientKey);
    if (!existing || now - existing.firstAttemptAt > LOGIN_WINDOW_MS) {
      await writeLoginAttempts(clientKey, { count: 1, firstAttemptAt: now, lockedUntil: 0 });
    } else {
      existing.count += 1;
      if (existing.count >= LOGIN_MAX_ATTEMPTS) {
        existing.lockedUntil = now + LOGIN_LOCKOUT_MS;
      }
      await writeLoginAttempts(clientKey, existing);
    }
    res.status(401).json({ error: "Invalid admin token." });
    return;
  }

  await deleteLoginAttempts(clientKey);
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await createSession(sessionId, expiresAt, getClientKey(req), req.get("user-agent") ?? "");
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
  res.status(200).json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* Shared endpoints                                                    */
/* ------------------------------------------------------------------ */

adminRouter.post("/admin/logout", async (req, res) => {
  const sessionId = readAdminSessionId(req);
  if (sessionId) await deleteSession(sessionId);
  clearAdminSessionCookie(res);
  res.status(200).json({ ok: true });
});

adminRouter.get("/admin/session", async (req, res) => {
  // Try JWT first
  const bearerToken = extractBearerToken(req.get("authorization"));
  if (bearerToken) {
    const admin = await verifySupabaseToken(bearerToken);
    if (admin) {
      res.status(200).json({ authenticated: true, authMethod: "supabase", user: { email: admin.email } });
      return;
    }
  }

  // Fall back to session cookie
  const sessionId = readAdminSessionId(req);
  if (!sessionId) {
    res.status(200).json({ authenticated: false });
    return;
  }
  const session = await readSession(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) await deleteSession(sessionId);
    res.status(200).json({ authenticated: false });
    return;
  }
  const newExpiry = Date.now() + SESSION_TTL_MS;
  await updateSessionExpiry(sessionId, newExpiry);
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
  res.status(200).json({ authenticated: true, authMethod: "session" });
});

/** Session gate: checks JWT first, then session cookie. */
async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  // Try JWT first
  const bearerToken = extractBearerToken(req.get("authorization"));
  if (bearerToken) {
    const admin = await verifySupabaseToken(bearerToken);
    if (admin) return true;
  }

  // Fall back to session cookie
  const sessionId = readAdminSessionId(req);
  if (!sessionId) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  const session = await readSession(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) await deleteSession(sessionId);
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  const newExpiry = Date.now() + SESSION_TTL_MS;
  await updateSessionExpiry(sessionId, newExpiry);
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
  return true;
}

async function guardedList(
  req: Request,
  res: Response,
  label: string,
  loader: () => Promise<unknown[]>,
) {
  if (!(await requireAdmin(req, res))) return;
  try {
    const entries = await loader();
    res.status(200).json({ entries, total: entries.length });
  } catch (error) {
    console.error(`[admin] Could not load ${label}:`, error);
    res.status(500).json({ error: `Could not load ${label}.` });
  }
}

adminRouter.get("/admin/waitlist", (req, res) => void guardedList(req, res, "waitlist submissions", listWaitlistSignups));
adminRouter.get("/admin/contact", (req, res) => void guardedList(req, res, "contact requests", listContactRequests));
adminRouter.get("/admin/demo", (req, res) => void guardedList(req, res, "demo requests", listDemoRequests));
adminRouter.get("/admin/newsletter", (req, res) =>
  void guardedList(req, res, "newsletter subscribers", listNewsletterSignups),
);

adminRouter.get("/admin/analytics", (req, res) => {
  void (async () => {
    if (!(await requireAdmin(req, res))) return;
    try {
      const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 500));
      const events = await listAnalyticsEvents(limit);
      const byEvent: Record<string, number> = {};
      const byPage: Record<string, number> = {};
      for (const record of events) {
        byEvent[record.event] = (byEvent[record.event] ?? 0) + 1;
        if (record.page) byPage[record.page] = (byPage[record.page] ?? 0) + 1;
      }
      const topPages = Object.entries(byPage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([page, count]) => ({ page, count }));
      res.status(200).json({ events, total: events.length, byEvent, topPages });
    } catch (error) {
      console.error("[admin] Could not load analytics:", error);
      res.status(500).json({ error: "Could not load analytics events." });
    }
  })();
});
