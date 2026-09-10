import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import { withHttpServer } from "../helpers/http";

const mocks = vi.hoisted(() => ({ consume: vi.fn(), distributed: vi.fn(() => true), prune: vi.fn() }));
vi.mock("../../server/services/securityStore", () => ({ consumeRateLimitBucket: mocks.consume, isDistributedRateLimiting: mocks.distributed, pruneRateLimitBuckets: mocks.prune }));
vi.mock("../../server/services/supabase", () => ({ getSupabaseAdmin: vi.fn(() => ({})) }));

import { rateLimit } from "../../server/middleware/rateLimit";

function createApp() {
  const app = express();
  app.use(rateLimit({ name: "test", max: 2, windowMs: 60_000 }));
  app.get("/", (_req, res) => res.json({ ok: true }));
  return app;
}

beforeEach(() => vi.clearAllMocks());

describe("distributed rate limiting", () => {
  it("allows requests below the limit", async () => {
    mocks.consume.mockResolvedValueOnce({ count: 1, resetAt: Date.now() + 60_000, allowed: true });
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.status).toBe(200);
      expect(response.headers.get("x-ratelimit-remaining")).toBe("1");
    });
  });

  it("returns 429 when the shared bucket is exhausted", async () => {
    mocks.consume.mockResolvedValueOnce({ count: 2, resetAt: Date.now() + 20_000, allowed: false });
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.status).toBe(429);
      expect(response.headers.get("retry-after")).toBeTruthy();
    });
  });

  it("fails closed when the shared security store is unavailable", async () => {
    mocks.consume.mockRejectedValueOnce(new Error("supabase unavailable"));
    await withHttpServer(createApp(), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "Request protection is temporarily unavailable. Please try again shortly." });
    });
  });

  it("keeps separate limiter names in separate buckets", async () => {
    const consume = mocks.consume.mockResolvedValue({ count: 1, resetAt: Date.now() + 60_000, allowed: true });
    const app = express();
    app.get("/a", rateLimit({ name: "a", max: 2, windowMs: 60_000 }), (_req, res) => res.sendStatus(200));
    app.get("/b", rateLimit({ name: "b", max: 2, windowMs: 60_000 }), (_req, res) => res.sendStatus(200));
    await withHttpServer(app, async (baseUrl) => {
      expect((await fetch(`${baseUrl}/a`)).status).toBe(200);
      expect((await fetch(`${baseUrl}/b`)).status).toBe(200);
      expect(consume.mock.calls.map((call) => call[0])).toEqual(["a:127.0.0.1", "b:127.0.0.1"]);
    });
  });
});
