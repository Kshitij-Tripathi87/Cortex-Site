import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import { withHttpServer } from "../helpers/http";

const mocks = vi.hoisted(() => ({
  authEnabled: vi.fn(),
  login: vi.fn(),
  createSession: vi.fn(),
  readSession: vi.fn(),
  updateSessionExpiry: vi.fn(),
  deleteSession: vi.fn(),
  pruneExpiredSessions: vi.fn(),
  adminLimiter: vi.fn(() => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
}));

vi.mock("../../server/services/supabase", () => ({ getSupabaseAdmin: vi.fn(() => ({})), isSupabaseEnabled: vi.fn(() => true) }));
vi.mock("../../server/services/auth", () => ({ isSupabaseAuthEnabled: mocks.authEnabled, loginWithSupabaseAuth: mocks.login }));
vi.mock("../../server/services/securityStore", () => ({
  createSession: mocks.createSession,
  readSession: mocks.readSession,
  updateSessionExpiry: mocks.updateSessionExpiry,
  deleteSession: mocks.deleteSession,
  pruneExpiredSessions: mocks.pruneExpiredSessions,
}));
vi.mock("../../server/middleware/rateLimit", () => ({ apiLimiters: { adminLogin: mocks.adminLimiter } }));
vi.mock("../../server/services/store", () => ({
  listAnalyticsEvents: vi.fn().mockResolvedValue([]), listContactRequests: vi.fn().mockResolvedValue([]),
  listDemoRequests: vi.fn().mockResolvedValue([]), listNewsletterSignups: vi.fn().mockResolvedValue([]), listWaitlistSignups: vi.fn().mockResolvedValue([]),
}));

import { adminRouter } from "../../server/routes/admin";

function createApp() { const app = express(); app.use(express.json()); app.use("/api", adminRouter); return app; }

async function post(baseUrl: string, path: string, body: unknown) {
  return fetch(`${baseUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

describe("admin authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authEnabled.mockReturnValue(true);
    mocks.login.mockResolvedValue({ userId: "auth-user-1", email: "admin@example.com" });
    mocks.createSession.mockResolvedValue(undefined);
    mocks.updateSessionExpiry.mockResolvedValue(undefined);
    mocks.deleteSession.mockResolvedValue(undefined);
    mocks.readSession.mockResolvedValue(null);
  });

  it("rejects invalid credentials without creating a session", async () => {
    mocks.login.mockResolvedValue(null);
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await post(baseUrl, "/api/admin/auth/login", { email: "admin@example.com", password: "wrong" });
      expect(response.status).toBe(401);
      expect(mocks.createSession).not.toHaveBeenCalled();
    });
  });

  it("returns 503 when Supabase Auth is unavailable", async () => {
    mocks.authEnabled.mockReturnValue(false);
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await post(baseUrl, "/api/admin/auth/login", { email: "admin@example.com", password: "test" });
      expect(response.status).toBe(503);
    });
  });

  it("creates an opaque secure session cookie after successful Auth login", async () => {
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await post(baseUrl, "/api/admin/auth/login", { email: "admin@example.com", password: "correct" });
      expect(response.status).toBe(200);
      expect((await response.json()).user.email).toBe("admin@example.com");
      const cookie = response.headers.get("set-cookie") || "";
      expect(cookie).toContain("cortex_admin_session=");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Strict");
      expect(mocks.createSession).toHaveBeenCalledOnce();
    });
  });

  it("requires the session for protected admin data", async () => {
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/waitlist`);
      expect(response.status).toBe(401);
    });
  });

  it("accepts a valid existing session and refreshes expiry", async () => {
    mocks.readSession.mockResolvedValue({ sessionId: "session-1", expiresAt: Date.now() + 60_000, ip: "127.0.0.1", userAgent: "test" });
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/waitlist`, { headers: { cookie: "cortex_admin_session=session-1" } });
      expect(response.status).toBe(200);
      expect(mocks.updateSessionExpiry).toHaveBeenCalledOnce();
    });
  });

  it("fails closed when the session store errors", async () => {
    mocks.readSession.mockRejectedValue(new Error("store unavailable"));
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/waitlist`, { headers: { cookie: "cortex_admin_session=session-1" } });
      expect(response.status).toBe(503);
    });
  });
});
