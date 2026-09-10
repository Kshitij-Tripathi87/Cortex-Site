import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import { withHttpServer } from "../helpers/http";

const mocks = vi.hoisted(() => ({
  saveContactRequest: vi.fn(),
  isDuplicateContact: vi.fn(),
  markContactNotification: vi.fn(),
  sendContactNotification: vi.fn(),
  saveDemoRequest: vi.fn(),
  isDuplicateDemo: vi.fn(),
  markDemoNotification: vi.fn(),
  sendDemoNotification: vi.fn(),
  saveWaitlistSignup: vi.fn(),
  isDuplicateWaitlist: vi.fn(),
  markWaitlistNotification: vi.fn(),
  sendWaitlistNotification: vi.fn(),
}));

vi.mock("../../server/middleware/rateLimit", () => ({ apiLimiters: { write: () => (_req: any, _res: any, next: any) => next() } }));
vi.mock("../../server/services/supabase", () => ({ getSupabaseAdmin: vi.fn(() => null), isSupabaseEnabled: vi.fn(() => false) }));
vi.mock("../../server/services/store", () => ({
  saveContactRequest: mocks.saveContactRequest, isDuplicateContact: mocks.isDuplicateContact, markContactNotification: mocks.markContactNotification,
  saveDemoRequest: mocks.saveDemoRequest, isDuplicateDemo: mocks.isDuplicateDemo, markDemoNotification: mocks.markDemoNotification,
  saveWaitlistSignup: mocks.saveWaitlistSignup, isDuplicateWaitlist: mocks.isDuplicateWaitlist, markWaitlistNotification: mocks.markWaitlistNotification,
  newId: (prefix: string) => `${prefix}-test`, submissionHash: (email: string, ...parts: string[]) => `${email}:${parts.join("|")}`,
}));
vi.mock("../../server/services/email", () => ({
  EMAIL_CONFIG_MISSING: "email_configuration_missing",
  sendContactNotification: mocks.sendContactNotification,
  sendDemoNotification: mocks.sendDemoNotification,
  sendWaitlistNotification: mocks.sendWaitlistNotification,
}));

import { contactRouter } from "../../server/routes/contact";
import { demoRouter } from "../../server/routes/demo";
import { waitlistRouter } from "../../server/routes/waitlist";

function createApp(router: express.Router) { const app = express(); app.use(express.json()); app.use("/api", router); return app; }
async function post(baseUrl: string, path: string, body: unknown) { return fetch(`${baseUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
const contactBody = { name: "Test User", email: "test@example.com", company: "TestCo", message: "This is a sufficiently long test message." };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isDuplicateContact.mockResolvedValue(false); mocks.isDuplicateDemo.mockResolvedValue(false); mocks.isDuplicateWaitlist.mockResolvedValue(false);
  mocks.saveContactRequest.mockResolvedValue({ success: true }); mocks.saveDemoRequest.mockResolvedValue({ success: true }); mocks.saveWaitlistSignup.mockResolvedValue({ success: true });
  mocks.markContactNotification.mockResolvedValue({ success: true }); mocks.markDemoNotification.mockResolvedValue({ success: true }); mocks.markWaitlistNotification.mockResolvedValue({ success: true });
  mocks.sendContactNotification.mockResolvedValue(undefined); mocks.sendDemoNotification.mockResolvedValue(undefined); mocks.sendWaitlistNotification.mockResolvedValue(undefined);
});

describe("form submission reliability", () => {
  it("rejects invalid contact input at the API boundary", async () => {
    await withHttpServer(createApp(contactRouter), async (baseUrl) => {
      expect((await post(baseUrl, "/api/contact", { ...contactBody, email: "bad" })).status).toBe(400);
      expect((await post(baseUrl, "/api/contact", { ...contactBody, name: "" })).status).toBe(400);
    });
  });

  it("persists before sending contact notification and uses an idempotency key", async () => {
    await withHttpServer(createApp(contactRouter), async (baseUrl) => {
      const response = await post(baseUrl, "/api/contact", contactBody);
      expect(response.status).toBe(200);
      expect(mocks.saveContactRequest).toHaveBeenCalledOnce();
      expect(mocks.sendContactNotification).toHaveBeenCalledOnce();
      const savedOrder = mocks.saveContactRequest.mock.invocationCallOrder[0];
      const emailOrder = mocks.sendContactNotification.mock.invocationCallOrder[0];
      expect(savedOrder).toBeLessThan(emailOrder);
      expect(mocks.sendContactNotification.mock.calls[0][1]).toContain("cortex-contact-");
    });
  });

  it("suppresses notification when contact persistence fails", async () => {
    mocks.saveContactRequest.mockResolvedValueOnce({ success: false, error: "database unavailable" });
    await withHttpServer(createApp(contactRouter), async (baseUrl) => {
      const response = await post(baseUrl, "/api/contact", contactBody);
      expect(response.status).toBe(502);
      expect(mocks.sendContactNotification).not.toHaveBeenCalled();
    });
  });

  it("keeps persisted contact successful when email delivery fails", async () => {
    mocks.sendContactNotification.mockRejectedValueOnce(new Error("Resend unavailable"));
    await withHttpServer(createApp(contactRouter), async (baseUrl) => {
      const response = await post(baseUrl, "/api/contact", contactBody);
      expect(response.status).toBe(200);
      expect((await response.json()).emailPending).toBe(true);
      expect(mocks.markContactNotification).toHaveBeenCalledOnce();
    });
  });

  it("returns duplicate without writing or emailing when duplicate is known", async () => {
    mocks.isDuplicateContact.mockResolvedValueOnce(true);
    await withHttpServer(createApp(contactRouter), async (baseUrl) => {
      const response = await post(baseUrl, "/api/contact", contactBody);
      expect(response.status).toBe(200);
      expect((await response.json()).duplicate).toBe(true);
      expect(mocks.saveContactRequest).not.toHaveBeenCalled();
      expect(mocks.sendContactNotification).not.toHaveBeenCalled();
    });
  });

  it("preserves the same failure-safe ordering for demo and waitlist forms", async () => {
    await withHttpServer(createApp(demoRouter), async (baseUrl) => {
      const response = await post(baseUrl, "/api/demo", { ...contactBody, role: "Engineering", companySize: "10-50" });
      expect(response.status).toBe(200); expect(mocks.saveDemoRequest).toHaveBeenCalledOnce(); expect(mocks.sendDemoNotification).toHaveBeenCalledOnce();
      expect(mocks.sendDemoNotification.mock.calls[0][1]).toContain("cortex-demo-");
    });
    await withHttpServer(createApp(waitlistRouter), async (baseUrl) => {
      const response = await post(baseUrl, "/api/waitlist", { name: contactBody.name, email: contactBody.email, company: contactBody.company });
      expect(response.status).toBe(200); expect(mocks.saveWaitlistSignup).toHaveBeenCalledOnce(); expect(mocks.sendWaitlistNotification).toHaveBeenCalledOnce();
      expect(mocks.sendWaitlistNotification.mock.calls[0][1]).toContain("cortex-waitlist-");
    });
  });
});
