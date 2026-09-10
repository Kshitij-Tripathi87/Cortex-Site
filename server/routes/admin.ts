/* Issue #6: durable distributed admin session and login security state. */

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
import {
  createSession,
  readSession,
  updateSessionExpiry,
  deleteSession,
  pruneExpiredSessions,
  readLoginAttempts,
  recordFailedLogin,
  deleteLoginAttempts,
  pruneLoginAttempts,
} from "../services/securityStore";

export const adminRouter = Router();

const isProduction = process.env.NODE_ENV === "production";
const ADMIN_SESSION_COOKIE = "cortex_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!name) continue;
    try { cookies[name] = decodeURIComponent(value); } catch { cookies[name] = value; }
  }
  return cookies;
}

function setAdminSessionCookie(res: Response, sessionId: string, maxAgeMs: number) {
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "HttpOnly", "Path=/", "SameSite=Strict", `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
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
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

function getClientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

const pruneInterval = setInterval(() => {
  void pruneExpiredSessions().catch((error) => console.error("[admin] session prune failed:", error));
  void pruneLoginAttempts().catch((error) => console.error("[admin] login-attempt prune failed:", error));
}, 15 * 60 * 1000);
pruneInterval.unref();

adminRouter.post("/admin/login", validateBody(AdminLoginSchema), async (req, res) => {
  const configuredToken = process.env.WORKFLO_ADMIN_TOKEN?.trim();
  if (!configuredToken) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }

  const clientKey = getClientKey(req);
  try {
    const attemptState = await readLoginAttempts(clientKey);
    const now = Date.now();
    if (attemptState?.lockedUntil && attemptState.lockedUntil > now) {
      res.setHeader("Retry-After", String(Math.ceil((attemptState.lockedUntil - now) / 1000)));
      res.status(429).json({ error: "Too many attempts. Please try again later." });
      return;
    }

    if (attemptState && now - attemptState.firstAttemptAt > LOGIN_WINDOW_MS) {
      await deleteLoginAttempts(clientKey);
    }

    const { token } = validated<AdminLoginInput>(req);
    if (!timingSafeStringsEqual(token, configuredToken)) {
      const state = await recordFailedLogin(clientKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS, LOGIN_LOCKOUT_MS);
      if (state.lockedUntil > now) {
        res.setHeader("Retry-After", String(Math.ceil((state.lockedUntil - now) / 1000)));
      }
      res.status(401).json({ error: "Invalid admin token." });
      return;
    }

    await deleteLoginAttempts(clientKey);
    const sessionId = randomBytes(32).toString("hex");
    await createSession(sessionId, Date.now() + SESSION_TTL_MS, clientKey, req.get("user-agent") ?? "");
    setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin] authentication state unavailable:", error);
    res.status(503).json({ error: "Authentication service is temporarily unavailable." });
  }
});

adminRouter.post("/admin/logout", async (req, res) => {
  const sessionId = readAdminSessionId(req);
  try {
    if (sessionId) await deleteSession(sessionId);
    clearAdminSessionCookie(res);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin] logout state unavailable:", error);
    res.status(503).json({ error: "Authentication service is temporarily unavailable." });
  }
});

adminRouter.get("/admin/session", async (req, res) => {
  const sessionId = readAdminSessionId(req);
  if (!sessionId) { res.status(200).json({ authenticated: false }); return; }
  try {
    const session = await readSession(sessionId);
    if (!session || session.expiresAt <= Date.now()) {
      if (session) await deleteSession(sessionId);
      res.status(200).json({ authenticated: false });
      return;
    }
    const newExpiry = Date.now() + SESSION_TTL_MS;
    await updateSessionExpiry(sessionId, newExpiry);
    setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
    res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error("[admin] session lookup unavailable:", error);
    res.status(503).json({ error: "Authentication service is temporarily unavailable." });
  }
});

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  const sessionId = readAdminSessionId(req);
  if (!sessionId) { res.status(401).json({ error: "Unauthorized." }); return false; }
  try {
    const session = await readSession(sessionId);
    if (!session || session.expiresAt <= Date.now()) {
      if (session) await deleteSession(sessionId);
      res.status(401).json({ error: "Unauthorized." });
      return false;
    }
    await updateSessionExpiry(sessionId, Date.now() + SESSION_TTL_MS);
    setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
    return true;
  } catch (error) {
    console.error("[admin] authorization state unavailable:", error);
    res.status(503).json({ error: "Authentication service is temporarily unavailable." });
    return false;
  }
}

async function guardedList(req: Request, res: Response, label: string, loader: () => Promise<unknown[]>) {
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
adminRouter.get("/admin/newsletter", (req, res) => void guardedList(req, res, "newsletter subscribers", listNewsletterSignups));

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
      const topPages = Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([page, count]) => ({ page, count }));
      res.status(200).json({ events, total: events.length, byEvent, topPages });
    } catch (error) {
      console.error("[admin] Could not load analytics:", error);
      res.status(500).json({ error: "Could not load analytics events." });
    }
  })();
});
