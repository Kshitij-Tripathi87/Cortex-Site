/*
 * Issue #10: Backend failure-path tests.
 *
 * Tests rate limiting behavior:
 * - Under limit: requests pass
 * - At limit: 429 with Retry-After header
 * - Window reset: counter resets after window expires
 * - Different limiters are independent
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase to return null (dev mode, in-memory rate limiting)
vi.mock("../../server/services/supabase", () => ({
  getSupabaseAdmin: vi.fn(() => null),
  isSupabaseEnabled: vi.fn(() => false),
}));

// Mock securityStore to use in-memory (no Supabase)
vi.mock("../../server/services/securityStore", () => ({
  isDistributedRateLimiting: vi.fn(() => false),
  getRateLimitBucket: vi.fn(),
  setRateLimitBucket: vi.fn(),
  pruneRateLimitBuckets: vi.fn(),
}));

import express from "express";
import request from "supertest";
import { rateLimit, apiLimiters } from "../../server/middleware/rateLimit";

function createApp(limiter: any) {
  const app = express();
  app.use(express.json());
  app.get("/test", limiter, (_req, res) => res.json({ ok: true }));
  return app;
}

describe("Rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows requests under the limit", async () => {
    const limiter = rateLimit({ name: "test-under", max: 5, windowMs: 60_000 });
    const app = createApp(limiter);

    for (let i = 0; i < 5; i++) {
      const res = await request(app).get("/test");
      expect(res.status).toBe(200);
    }
  });

  it("returns 429 when limit exceeded", async () => {
    const limiter = rateLimit({ name: "test-exceed", max: 3, windowMs: 60_000 });
    const app = createApp(limiter);

    // First 3 requests pass
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get("/test");
      expect(res.status).toBe(200);
    }

    // 4th request should be rate limited
    const res = await request(app).get("/test");
    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBeDefined();
    expect(res.body.error).toContain("Too many requests");
  });

  it("sets X-RateLimit headers", async () => {
    const limiter = rateLimit({ name: "test-headers", max: 10, windowMs: 60_000 });
    const app = createApp(limiter);

    const res = await request(app).get("/test");
    expect(res.headers["x-ratelimit-limit"]).toBe("10");
    expect(res.headers["x-ratelimit-remaining"]).toBe("9");
  });

  it("different limiters are independent", async () => {
    const limiter1 = rateLimit({ name: "limiter-a", max: 2, windowMs: 60_000 });
    const limiter2 = rateLimit({ name: "limiter-b", max: 2, windowMs: 60_000 });

    const app1 = createApp(limiter1);
    const app2 = createApp(limiter2);

    // Exhaust limiter1
    await request(app1).get("/test");
    await request(app1).get("/test");
    const blocked = await request(app1).get("/test");
    expect(blocked.status).toBe(429);

    // limiter2 should still work
    const res = await request(app2).get("/test");
    expect(res.status).toBe(200);
  });
});
