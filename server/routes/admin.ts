/*
 * Issue #6: Distributed security state.
 *
 * Admin sessions and login attempts now use Supabase-backed storage
 * via securityStore.ts. This means:
 * - Sessions survive Render restarts (durable)
 * - Sessions can be revoked from the database (revocable)
 * - Login attempt tracking is shared across instances (distributed)
 *
 * The shared admin token (WORKFLO_ADMIN_TOKEN) remains the auth credential.
 * Migration to Supabase Auth is tracked in Issue #7.
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

export const adminRouter = Router();

const isProduction = process.env.NODE_ENV === "production";
const ADMIN_SESSION_COOKIE = "cortex_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours, refreshed on activity
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

// Prune expired sessions and login attempts periodically
const pruneInterval = setInterval(() => {
  void pruneExpiredSessions();
  void pruneLoginAttempts();
}, 15 * 60 * 1000);
pruneInterval.unref();

adminRouter.post("/admin/login", validateBody(AdminLoginSchema), async (req, res) => {
  const configuredToken = process.env.WORKFLO_ADMIN_TOKEN?.trim();
  if (!configuredToken) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }

  const clientKey = getClientKey(req);

  // Check login rate limit (now distributed)
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
    // Record failed login (now distributed)
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

  // Success: clear login attempts and create session
  await deleteLoginAttempts(clientKey);
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await createSession(sessionId, expiresAt, getClientKey(req), req.get("user-agent") ?? "");
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
  res.status(200).json({ ok: true });
});

adminRouter.post("/admin/logout", async (req, res) => {
  const sessionId = readAdminSessionId(req);
  if (sessionId) await deleteSession(sessionId);
  clearAdminSessionCookie(res);
  res.status(200).json({ ok: true });
});

adminRouter.get("/admin/session", async (req, res) => {
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
  // Refresh session
  const newExpiry = Date.now() + SESSION_TTL_MS;
  await updateSessionExpiry(sessionId, newExpiry);
  setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
  res.status(200).json({ authenticated: true });
});

/** Session gate for admin reads. Refreshes the cookie on every valid call. */
async function requireAdmin(req: Request, res: Response): Promise<boolean> {
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
  // Refresh session
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

/** Recent analytics events plus funnel aggregates for the future dashboard. */
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
