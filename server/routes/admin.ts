/* Silverline Systems reminder: admin access is server-side identity. The browser
 * holds an opaque httpOnly session cookie — never the credential — that the
 * server can invalidate at any time. (Supabase Auth migration: backend phase.)
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { AdminLoginSchema, type AdminLoginInput } from "../../shared/schemas";
import { validateBody, validated } from "../middleware/validation";
import {
  listAnalyticsEvents,
  listContactRequests,
  listDemoRequests,
  listNewsletterSignups,
  listWaitlistSignups,
} from "../services/store";

export const adminRouter = Router();

const isProduction = process.env.NODE_ENV === "production";
const ADMIN_SESSION_COOKIE = "cortex_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours, refreshed on activity
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

type AdminSession = { expiresAt: number };
type LoginAttemptState = { count: number; firstAttemptAt: number; lockedUntil: number };

const adminSessions = new Map<string, AdminSession>();
const loginAttempts = new Map<string, LoginAttemptState>();

function pruneExpiredAuthState() {
  const now = Date.now();
  adminSessions.forEach((session, id) => {
    if (session.expiresAt <= now) adminSessions.delete(id);
  });
  loginAttempts.forEach((state, ip) => {
    if (state.lockedUntil <= now && state.firstAttemptAt + LOGIN_WINDOW_MS <= now) loginAttempts.delete(ip);
  });
}
const pruneInterval = setInterval(pruneExpiredAuthState, 15 * 60 * 1000);
pruneInterval.unref();

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

function createAdminSession(): string {
  const sessionId = randomBytes(32).toString("hex");
  adminSessions.set(sessionId, { expiresAt: Date.now() + SESSION_TTL_MS });
  return sessionId;
}

function readAdminSessionId(req: Request): string | undefined {
  return parseCookies(req.get("cookie"))[ADMIN_SESSION_COOKIE];
}

function isAdminSessionValid(sessionId: string | undefined): boolean {
  if (!sessionId) return false;
  const session = adminSessions.get(sessionId);
  if (!session) return false;
  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(sessionId);
    return false;
  }
  return true;
}

function timingSafeStringsEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

function getClientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function checkLoginRateLimit(clientKey: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const state = loginAttempts.get(clientKey);
  if (!state) return { allowed: true };
  if (state.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000) };
  }
  if (now - state.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(clientKey);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(clientKey: string) {
  const now = Date.now();
  const state = loginAttempts.get(clientKey);
  if (!state || now - state.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(clientKey, { count: 1, firstAttemptAt: now, lockedUntil: 0 });
    return;
  }
  state.count += 1;
  if (state.count >= LOGIN_MAX_ATTEMPTS) {
    state.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }
}

/** Session gate for admin reads. Refreshes the cookie on every valid call. */
function requireAdmin(req: Request, res: Response): boolean {
  const sessionId = readAdminSessionId(req);
  if (!isAdminSessionValid(sessionId)) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  const session = adminSessions.get(sessionId!);
  if (session) session.expiresAt = Date.now() + SESSION_TTL_MS;
  setAdminSessionCookie(res, sessionId!, SESSION_TTL_MS);
  return true;
}

adminRouter.post("/admin/login", validateBody(AdminLoginSchema), async (req, res) => {
  const configuredToken = process.env.WORKFLO_ADMIN_TOKEN?.trim();
  if (!configuredToken) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }

  const clientKey = getClientKey(req);
  const rateLimit = checkLoginRateLimit(clientKey);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds ?? 60));
    res.status(429).json({ error: "Too many attempts. Please try again later." });
    return;
  }

  const { token } = validated<AdminLoginInput>(req);
  if (!timingSafeStringsEqual(token, configuredToken)) {
    recordFailedLogin(clientKey);
    res.status(401).json({ error: "Invalid admin token." });
    return;
  }

  loginAttempts.delete(clientKey);
  const sessionId = createAdminSession();
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
  res.status(200).json({ ok: true });
});

adminRouter.post("/admin/logout", (req, res) => {
  const sessionId = readAdminSessionId(req);
  if (sessionId) adminSessions.delete(sessionId);
  clearAdminSessionCookie(res);
  res.status(200).json({ ok: true });
});

adminRouter.get("/admin/session", (req, res) => {
  const sessionId = readAdminSessionId(req);
  const valid = isAdminSessionValid(sessionId);
  if (valid) {
    const session = adminSessions.get(sessionId!);
    if (session) session.expiresAt = Date.now() + SESSION_TTL_MS;
    setAdminSessionCookie(res, sessionId!, SESSION_TTL_MS);
  }
  res.status(200).json({ authenticated: valid });
});

async function guardedList(
  req: Request,
  res: Response,
  label: string,
  loader: () => Promise<unknown[]>,
) {
  if (!requireAdmin(req, res)) return;
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

/** Recent analytics events plus funnel aggregates for the future dashboard. */
adminRouter.get("/admin/analytics", (req, res) => {
  if (!requireAdmin(req, res)) return;
  void (async () => {
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
