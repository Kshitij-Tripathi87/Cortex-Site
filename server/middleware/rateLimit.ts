/*
 * Issue #6: Distributed security state.
 *
 * Rate limiter now supports both in-memory (dev) and Supabase-backed
 * (production) storage. In production on Render, rate limits survive
 * process restarts and are shared across instances.
 *
 * The in-memory path remains synchronous for zero-latency dev mode.
 * The Supabase path is async with a sync fallback to avoid blocking.
 */

import type { NextFunction, Request, Response } from "express";
import { isDistributedRateLimiting, getRateLimitBucket, setRateLimitBucket, pruneRateLimitBuckets } from "../services/securityStore";

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

/** In-memory fallback store (dev mode only). */
const localBuckets = new Map<string, { count: number; resetAt: number }>();

function pruneLocal() {
  const now = Date.now();
  localBuckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) localBuckets.delete(key);
  });
}
const pruneInterval = setInterval(pruneLocal, 60_000);
pruneInterval.unref();

// Also prune distributed buckets periodically
if (isDistributedRateLimiting()) {
  const distPrune = setInterval(() => void pruneRateLimitBuckets(), 60_000);
  distPrune.unref();
}

/**
 * Synchronous rate limiter (in-memory).
 * Used in development or as a fast-path fallback.
 */
function rateLimitSync({ max, windowMs, name }: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${name}:${clientKey(req)}`;
    const existing = localBuckets.get(key);

    if (!existing || existing.resetAt <= now) {
      localBuckets.set(key, { count: 1, resetAt: now + windowMs });
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

/**
 * Async rate limiter (Supabase-backed).
 * Used in production when Supabase is configured.
 */
function rateLimitDistributed({ max, windowMs, name }: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${name}:${clientKey(req)}`;

    try {
      const existing = await getRateLimitBucket(key);

      if (!existing || existing.resetAt <= now) {
        await setRateLimitBucket(key, { count: 1, resetAt: now + windowMs });
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
      await setRateLimitBucket(key, existing);
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - existing.count));
      next();
    } catch (error) {
      // If Supabase fails, fall back to sync in-memory to avoid blocking users.
      console.error("[rateLimit] Distributed rate limit failed, falling back to sync:", error);
      const localKey = `${name}:${clientKey(req)}`;
      const local = localBuckets.get(localKey);
      if (!local || local.resetAt <= now) {
        localBuckets.set(localKey, { count: 1, resetAt: now + windowMs });
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", String(max - 1));
        next();
        return;
      }
      if (local.count >= max) {
        const retryAfter = Math.max(1, Math.ceil((local.resetAt - now) / 1000));
        res.setHeader("Retry-After", String(retryAfter));
        res.status(429).json({ error: "Too many requests. Please try again shortly." });
        return;
      }
      local.count += 1;
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - local.count));
      next();
    }
  };
}

/**
 * Rate limiter that automatically selects sync (dev) or distributed (prod).
 */
export function rateLimit(options: RateLimitOptions) {
  if (isDistributedRateLimiting()) {
    return rateLimitDistributed(options);
  }
  return rateLimitSync(options);
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
