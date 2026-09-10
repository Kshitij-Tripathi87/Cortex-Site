/*
 * Issue #10: Backend failure-path tests.
 *
 * Tests AI proxy failure paths:
 * - Grounded fallback when Ollama not configured
 * - Timeout classification and fallback
 * - Upstream error handling
 * - Malformed response handling
 * - Response size limits
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock supabase
vi.mock("../../server/services/supabase", () => ({
  getSupabaseAdmin: vi.fn(() => null),
  isSupabaseEnabled: vi.fn(() => false),
}));

// Mock rate limiter to pass-through
vi.mock("../../server/middleware/rateLimit", () => ({
  apiLimiters: {
    ai: () => (_req: any, _res: any, next: any) => next(),
    write: () => (_req: any, _res: any, next: any) => next(),
    read: () => (_req: any, _res: any, next: any) => next(),
    analytics: () => (_req: any, _res: any, next: any) => next(),
  },
  rateLimit: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock security middleware
vi.mock("../../server/middleware/security", () => ({
  securityHeaders: (_req: any, _res: any, next: any) => next(),
  requestId: (req: any, res: any, next: any) => {
    (req as any).requestId = "test-req-id";
    res.setHeader("X-Request-Id", "test-req-id");
    next();
  },
  getRequestId: (req: any) => (req as any).requestId ?? "unknown",
  jsonErrorHandler: (err: any, _req: any, res: any, next: any) => next(err),
}));

import express from "express";
import request from "supertest";
import { aiRouter } from "../../server/routes/ai";
import { __resetOllamaHealthForTests } from "../../server/services/ollamaHealth";

global.fetch = vi.fn() as any;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", aiRouter);
  return app;
}

describe("AI proxy failure paths", () => {
  beforeEach(() => {
    __resetOllamaHealthForTests();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.OLLAMA_MODEL;
  });

  it("returns grounded fallback when Ollama not configured", async () => {
    delete process.env.OLLAMA_BASE_URL;
    const app = createApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ prompt: "What is Workflo?" });
    expect(res.status).toBe(200);
    expect(res.body.model).toBe("grounded-fallback");
    expect(res.body.reply).toBeDefined();
    expect(res.body.source).toBeDefined();
  });

  it("falls back to grounded answer on timeout", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    (global.fetch as any).mockImplementationOnce(() => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
      throw error;
    });

    const app = createApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ prompt: "What is Nexus?" });
    expect(res.status).toBe(200);
    expect(res.body.model).toBe("grounded-fallback");
  });

  it("falls back to grounded answer on upstream error", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const app = createApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ prompt: "What is ASTRA?" });
    expect(res.status).toBe(200);
    expect(res.body.model).toBe("grounded-fallback");
  });

  it("falls back to grounded answer on malformed response", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}), // no message.content
    });

    const app = createApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ prompt: "What is the platform?" });
    expect(res.status).toBe(200);
    // Should fall back to grounded answer since message.content is missing
    expect(res.body.reply).toBeDefined();
  });

  it("returns valid response on successful Ollama call", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        message: { content: "Workflo is the execution assurance layer." },
      }),
    });

    const app = createApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ prompt: "What is Workflo?" });
    expect(res.status).toBe(200);
    expect(res.body.model).toBe("llama3");
    expect(res.body.reply).toContain("Workflo");
  });

  it("rejects empty prompt", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ prompt: "" });
    expect(res.status).toBe(400);
  });

  it("rejects overly long prompt", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ prompt: "x".repeat(2001) });
    expect(res.status).toBe(400);
  });
});
