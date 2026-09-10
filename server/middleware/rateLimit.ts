import type { NextFunction, Request, Response } from "express";
import { consumeRateLimitBucket, isDistributedRateLimiting, pruneRateLimitBuckets } from "../services/securityStore";

type LocalBucket = { count: number; resetAt: number };

function clientKey(req: Request): string {
  const forwarded = req.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "unknown";
  return ip.slice(0, 128);
}

export type RateLimitOptions = { max: number; windowMs: number; name: string };

const localBuckets = new Map<string, LocalBucket>();
const pruneInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of localBuckets) if (bucket.resetAt <= now) localBuckets.delete(key);
  if (isDistributedRateLimiting()) void pruneRateLimitBuckets().catch((error) => console.error("[rateLimit] prune failed:", error));
}, 60_000);
pruneInterval.unref();

function applyHeaders(res: Response, max: number, count: number, resetAt: number): void {
  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - count)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
}

function rateLimitLocal({ max, windowMs, name }: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${name}:${clientKey(req)}`;
    const current = localBuckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 1, resetAt: now + windowMs }
      : current.count >= max
        ? current
        : { count: current.count + 1, resetAt: current.resetAt };
    localBuckets.set(key, bucket);
    applyHeaders(res, max, bucket.count, bucket.resetAt);
    if (bucket.count > max - 1 && current && current.resetAt > now && current.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ error: "Too many requests. Please try again shortly." });
      return;
    }
    next();
  };
}

function rateLimitDistributed({ max, windowMs, name }: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${clientKey(req)}`;
    try {
      const bucket = await consumeRateLimitBucket(key, max, windowMs);
      applyHeaders(res, max, bucket.count, bucket.resetAt);
      if (!bucket.allowed) {
        const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000));
        res.setHeader("Retry-After", String(retryAfter));
        res.status(429).json({ error: "Too many requests. Please try again shortly." });
        return;
      }
      next();
    } catch (error) {
      console.error("[rateLimit] Distributed store unavailable; failing closed:", error);
      res.status(503).json({ error: "Request protection is temporarily unavailable. Please try again shortly." });
    }
  };
}

export function rateLimit(options: RateLimitOptions) {
  return isDistributedRateLimiting() ? rateLimitDistributed(options) : rateLimitLocal(options);
}

export const apiLimiters = {
  write: () => rateLimit({ name: "api-write", max: 12, windowMs: 10 * 60_000 }),
  ai: () => rateLimit({ name: "api-ai", max: 20, windowMs: 10 * 60_000 }),
  analytics: () => rateLimit({ name: "api-analytics", max: 120, windowMs: 60_000 }),
  read: () => rateLimit({ name: "api-read", max: 120, windowMs: 60_000 }),
  adminLogin: () => rateLimit({ name: "admin-login", max: 8, windowMs: 15 * 60_000 }),
};
