/* Silverline Systems reminder: rate limits are guardrails, not punishments. Keep
 * windows short, responses explicit, and Retry-After honest. */

import type { NextFunction, Request, Response } from "express";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune() {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}

const pruneInterval = setInterval(prune, 60_000);
pruneInterval.unref();

function clientKey(req: Request): string {
  const forwarded = req.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "unknown";
  return ip.slice(0, 128);
}

export type RateLimitOptions = {
  /** Max requests per window per client. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Distinguishes limiters sharing the same store. */
  name: string;
};

export function rateLimit({ max, windowMs, name }: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${name}:${clientKey(req)}`;
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      next();
      return;
    }

    if (existing.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.status(429).json({ error: "Too many requests. Please try again shortly." });
      return;
    }

    existing.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(max - existing.count));
    next();
  };
}

/** Presets tuned for a marketing site: generous reads, strict writes. */
export const apiLimiters = {
  /** Form submissions and other PII writes. */
  write: () => rateLimit({ name: "api-write", max: 12, windowMs: 10 * 60_000 }),
  /** AI chat: strict enough to stop abuse, loose enough for real use. */
  ai: () => rateLimit({ name: "api-ai", max: 20, windowMs: 10 * 60_000 }),
  /** Analytics beacons. */
  analytics: () => rateLimit({ name: "api-analytics", max: 120, windowMs: 60_000 }),
  /** Public content reads. */
  read: () => rateLimit({ name: "api-read", max: 120, windowMs: 60_000 }),
};
