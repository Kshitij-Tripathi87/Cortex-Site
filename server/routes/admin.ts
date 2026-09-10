/* Private Cortex admin surface: Supabase Auth identity + opaque server session. */

import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { apiLimiters } from "../middleware/rateLimit";
import {
  listAnalyticsEvents, listContactRequests, listDemoRequests,
  listNewsletterSignups, listWaitlistSignups,
} from "../services/store";
import {
  createSession, readSession, updateSessionExpiry, deleteSession,
  pruneExpiredSessions,
} from "../services/securityStore";
import { isSupabaseAuthEnabled, loginWithSupabaseAuth } from "../services/auth";
import { validateBody, validated } from "../middleware/validation";

export const adminRouter = Router();

const isProduction = process.env.NODE_ENV === "production";
const ADMIN_SESSION_COOKIE = "cortex_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const SupabaseLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
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
    try { cookies[name] = decodeURIComponent(value); } catch { cookies[name] = value; }
  }
  return cookies;
}

function readAdminSessionId(req: Request): string | undefined {
  return parseCookies(req.get("cookie"))[ADMIN_SESSION_COOKIE];
}

function setAdminSessionCookie(res: Response, sessionId: string, maxAgeMs: number): void {
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "HttpOnly", "Path=/", "SameSite=Strict", `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (isProduction) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

function clearAdminSessionCookie(res: Response): void {
  const attributes = [`${ADMIN_SESSION_COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Strict", "Max-Age=0"];
  if (isProduction) attributes.push("Secure");
  res.setHeader("Set-Cookie", attributes.join("; "));
}

const pruneInterval = setInterval(() => {
  void pruneExpiredSessions().catch((error) => console.error("[admin] session prune failed:", error));
}, 15 * 60 * 1000);
pruneInterval.unref();

adminRouter.post("/admin/auth/login", apiLimiters.adminLogin(), validateBody(SupabaseLoginSchema), async (req, res) => {
  if (!isSupabaseAuthEnabled()) {
    res.status(503).json({ error: "Authentication service is not configured." });
    return;
  }
  try {
    const { email, password } = validated<SupabaseLoginInput>(req);
    const admin = await loginWithSupabaseAuth(email, password);
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }
    const sessionId = cryptoRandomSessionId();
    await createSession(sessionId, Date.now() + SESSION_TTL_MS, req.ip || req.socket.remoteAddress || "unknown", req.get("user-agent") ?? "");
    setAdminSessionCookie(res, sessionId, SESSION_TTL_MS);
    res.status(200).json({ ok: true, user: { email: admin.email } });
  } catch (error) {
    console.error("[admin] Supabase Auth login failed:", error);
    res.status(503).json({ error: "Authentication service is temporarily unavailable." });
  }
});

function cryptoRandomSessionId(): string {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

adminRouter.post("/admin/logout", async (req, res) => {
  try {
    const sessionId = readAdminSessionId(req);
    if (sessionId) await deleteSession(sessionId);
    clearAdminSessionCookie(res);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin] logout failed:", error);
    res.status(503).json({ error: "Authentication service is temporarily unavailable." });
  }
});

async function sessionIdentity(req: Request): Promise<{ ok: true; sessionId: string } | { ok: false; status: number; error: string }> {
  const sessionId = readAdminSessionId(req);
  if (!sessionId) return { ok: false, status: 401, error: "Unauthorized." };
  try {
    const session = await readSession(sessionId);
    if (!session || session.expiresAt <= Date.now()) {
      if (session) await deleteSession(sessionId);
      return { ok: false, status: 401, error: "Unauthorized." };
    }
    await updateSessionExpiry(sessionId, Date.now() + SESSION_TTL_MS);
    return { ok: true, sessionId };
  } catch (error) {
    console.error("[admin] session lookup failed:", error);
    return { ok: false, status: 503, error: "Authentication service is temporarily unavailable." };
  }
}

adminRouter.get("/admin/session", async (req, res) => {
  const identity = await sessionIdentity(req);
  if (!identity.ok) { clearAdminSessionCookie(res); res.status(identity.status).json({ error: identity.error, authenticated: false }); return; }
  setAdminSessionCookie(res, identity.sessionId, SESSION_TTL_MS);
  res.status(200).json({ authenticated: true });
});

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  const identity = await sessionIdentity(req);
  if (!identity.ok) { res.status(identity.status).json({ error: identity.error }); return false; }
  setAdminSessionCookie(res, identity.sessionId, SESSION_TTL_MS);
  return true;
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
