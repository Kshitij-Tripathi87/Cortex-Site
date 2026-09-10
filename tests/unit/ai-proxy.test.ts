import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import { withHttpServer } from "../helpers/http";

vi.mock("../../server/services/supabase", () => ({ getSupabaseAdmin: vi.fn(() => null), isSupabaseEnabled: vi.fn(() => false) }));
vi.mock("../../server/middleware/rateLimit", () => ({ apiLimiters: { ai: () => (_req: any, _res: any, next: any) => next() } }));
vi.mock("../../server/middleware/security", () => ({
  securityHeaders: (_req: any, _res: any, next: any) => next(),
  requestId: (req: any, res: any, next: any) => { req.requestId = "test-req-id"; res.setHeader("X-Request-Id", "test-req-id"); next(); },
  getRequestId: (req: any) => req.requestId ?? "unknown",
  jsonErrorHandler: (err: any, _req: any, res: any, next: any) => next(err),
}));

import { aiRouter } from "../../server/routes/ai";
import { __resetOllamaHealthForTests } from "../../server/services/ollamaHealth";

function createApp() { const app = express(); app.use(express.json()); app.use("/api", aiRouter); return app; }
const nativeFetch = global.fetch.bind(global);
async function post(baseUrl: string, body: unknown) { return nativeFetch(`${baseUrl}/api/ai/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
const jsonResponse = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, headers: new Headers({ "content-type": "application/json", "content-length": String(Buffer.byteLength(JSON.stringify(body))) }), text: async () => JSON.stringify(body) });
global.fetch = vi.fn();

describe("AI proxy failure paths", () => {
  beforeEach(() => { __resetOllamaHealthForTests(); vi.clearAllMocks(); });
  afterEach(() => { delete process.env.OLLAMA_BASE_URL; delete process.env.OLLAMA_MODEL; });

  it("returns grounded fallback when Ollama is not configured", async () => {
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await post(baseUrl, { prompt: "What is Workflo?" });
      expect(response.status).toBe(200);
      expect((await response.json()).model).toBe("grounded-fallback");
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("falls back to grounded answer on timeout", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    vi.mocked(global.fetch).mockRejectedValueOnce(Object.assign(new Error("aborted"), { name: "AbortError" }));
    await withHttpServer(createApp(), async (baseUrl) => { expect((await post(baseUrl, { prompt: "What is Nexus?" })).status).toBe(200); });
  });

  it("falls back to grounded answer on upstream error", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    vi.mocked(global.fetch).mockResolvedValueOnce(jsonResponse({ error: "down" }, 500) as Response);
    await withHttpServer(createApp(), async (baseUrl) => { expect((await (await post(baseUrl, { prompt: "What is Nexus?" })).json()).model).toBe("grounded-fallback"); });
  });

  it("falls back on malformed Ollama JSON", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, status: 200, headers: new Headers({ "content-length": "8" }), text: async () => "not-json" } as Response);
    await withHttpServer(createApp(), async (baseUrl) => { expect((await (await post(baseUrl, { prompt: "What is the platform?" })).json()).model).toBe("grounded-fallback"); });
  });

  it("returns a bounded successful Ollama response", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    process.env.OLLAMA_MODEL = "llama3";
    vi.mocked(global.fetch).mockResolvedValueOnce(jsonResponse({ message: { content: "Workflo provides execution assurance." } }) as Response);
    await withHttpServer(createApp(), async (baseUrl) => { const payload = await (await post(baseUrl, { prompt: "What is Workflo?" })).json(); expect(payload.model).toBe("llama3"); expect(payload.reply).toContain("Workflo"); });
  });

  it("falls back when the upstream response exceeds the byte limit", async () => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    const oversized = "x".repeat(17_000);
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, status: 200, headers: new Headers({ "content-length": String(oversized.length) }), text: async () => oversized } as Response);
    await withHttpServer(createApp(), async (baseUrl) => { expect((await (await post(baseUrl, { prompt: "Explain Cortex." })).json()).model).toBe("grounded-fallback"); });
  });

  it("rejects empty and oversized prompts", async () => {
    await withHttpServer(createApp(), async (baseUrl) => {
      expect((await post(baseUrl, { prompt: "" })).status).toBe(400);
      expect((await post(baseUrl, { prompt: "x".repeat(2001) })).status).toBe(400);
    });
  });
});
