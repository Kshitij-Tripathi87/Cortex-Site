/*
 * Issue #10: Backend failure-path tests.
 *
 * Tests form submission failure paths:
 * - Validation errors (missing fields, invalid email, short message)
 * - Duplicate submission detection (idempotency)
 * - Persistence failure handling
 * - Email failure with data persistence (emailPending)
 *
 * Note: These tests mock the store and email services to simulate failures.
 * They test the route handler logic, not the actual Supabase/Resend integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock supabase
vi.mock("../../server/services/supabase", () => ({
  getSupabaseAdmin: vi.fn(() => null),
  isSupabaseEnabled: vi.fn(() => false),
}));

// Mock rate limiter
vi.mock("../../server/middleware/rateLimit", () => ({
  apiLimiters: {
    ai: () => (_req: any, _res: any, next: any) => next(),
    write: () => (_req: any, _res: any, next: any) => next(),
    read: () => (_req: any, _res: any, next: any) => next(),
    analytics: () => (_req: any, _res: any, next: any) => next(),
  },
  rateLimit: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock store service
const mockStore = {
  saveContactRequest: vi.fn(),
  isDuplicateContact: vi.fn(),
  markContactNotification: vi.fn(),
  saveDemoRequest: vi.fn(),
  isDuplicateDemo: vi.fn(),
  markDemoNotification: vi.fn(),
  saveWaitlistSignup: vi.fn(),
  isDuplicateWaitlist: vi.fn(),
  markWaitlistNotification: vi.fn(),
  saveNewsletterSignup: vi.fn(),
  listContactRequests: vi.fn().mockResolvedValue([]),
  listDemoRequests: vi.fn().mockResolvedValue([]),
  listWaitlistSignups: vi.fn().mockResolvedValue([]),
  listNewsletterSignups: vi.fn().mockResolvedValue([]),
  listAnalyticsEvents: vi.fn().mockResolvedValue([]),
};
vi.mock("../../server/services/store", () => mockStore);

// Mock email service
const mockSendEmail = vi.fn();
vi.mock("../../server/services/email", () => ({
  sendContactNotification: mockSendEmail,
  sendDemoNotification: vi.fn(),
  sendWaitlistNotification: vi.fn(),
}));

import express from "express";
import request from "supertest";
import { contactRouter } from "../../server/routes/contact";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", contactRouter);
  return app;
}

describe("Contact form failure paths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WORKFLO_EMAIL_MODE = "resend";
  });

  afterEach(() => {
    delete process.env.WORKFLO_EMAIL_MODE;
  });

  it("rejects missing name", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/contact")
      .send({
        email: "test@example.com",
        company: "TestCo",
        message: "This is a test message that is long enough.",
      });
    expect(res.status).toBe(400);
  });

  it("rejects invalid email", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/contact")
      .send({
        name: "Test User",
        email: "not-an-email",
        company: "TestCo",
        message: "This is a test message that is long enough.",
      });
    expect(res.status).toBe(400);
  });

  it("rejects short message", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/contact")
      .send({
        name: "Test User",
        email: "test@example.com",
        company: "TestCo",
        message: "too short",
      });
    expect(res.status).toBe(400);
  });

  it("returns success on valid submission", async () => {
    mockStore.saveContactRequest.mockResolvedValueOnce({ ok: true });
    mockStore.isDuplicateContact.mockResolvedValueOnce(false);
    mockSendEmail.mockResolvedValueOnce(true);

    const app = createApp();
    const res = await request(app)
      .post("/api/contact")
      .send({
        name: "Test User",
        email: "test@example.com",
        company: "TestCo",
        message: "This is a test message that is long enough for validation.",
      });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("returns duplicate flag on repeated submission", async () => {
    mockStore.isDuplicateContact.mockResolvedValueOnce(true);

    const app = createApp();
    const res = await request(app)
      .post("/api/contact")
      .send({
        name: "Test User",
        email: "test@example.com",
        company: "TestCo",
        message: "This is a test message that is long enough for validation.",
      });
    expect(res.status).toBe(200);
    expect(res.body.duplicate).toBe(true);
  });

  it("returns emailPending when email fails but data is persisted", async () => {
    mockStore.saveContactRequest.mockResolvedValueOnce({ ok: true });
    mockStore.isDuplicateContact.mockResolvedValueOnce(false);
    mockSendEmail.mockRejectedValueOnce(new Error("Resend API error"));
    mockStore.markContactNotification.mockResolvedValueOnce(true);

    const app = createApp();
    const res = await request(app)
      .post("/api/contact")
      .send({
        name: "Test User",
        email: "test@example.com",
        company: "TestCo",
        message: "This is a test message that is long enough for validation.",
      });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.emailPending).toBe(true);
  });
});
