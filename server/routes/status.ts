/*
 * Issue #8: Harden Ollama proxy.
 *
 * Status endpoint now reports real Ollama provider health (success rate,
 * latency, consecutive failures) instead of just "is the URL configured."
 */

import { Router } from "express";
import { apiLimiters } from "../middleware/rateLimit";
import { isSupabaseEnabled } from "../services/supabase";
import { getOllamaHealth } from "../services/ollamaHealth";

export const statusRouter = Router();

const startedAt = new Date().toISOString();
const bootTime = Date.now();

/** Liveness probe for uptime monitors and load balancers. */
statusRouter.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), uptimeSeconds: Math.floor((Date.now() - bootTime) / 1000) });
});

/** Public status snapshot consumed by the /status page. */
statusRouter.get("/status", apiLimiters.read(), (_req, res) => {
  const emailConfigured =
    (process.env.WORKFLO_EMAIL_MODE || "resend").trim().toLowerCase() === "mock" ||
    Boolean(process.env.RESEND_API_KEY?.trim());
  const ollamaHealth = getOllamaHealth();

  // Determine AI Core status from real health data
  let aiCoreStatus: string = "degraded";
  if (!ollamaHealth.configured) {
    aiCoreStatus = "degraded";
  } else if (ollamaHealth.consecutiveFailures >= 3) {
    aiCoreStatus = "down";
  } else if (ollamaHealth.consecutiveFailures > 0 || ollamaHealth.successRate < 0.8) {
    aiCoreStatus = "degraded";
  } else {
    aiCoreStatus = "operational";
  }

  res.json({
    ok: true,
    status: "operational",
    timestamp: new Date().toISOString(),
    startedAt,
    uptimeSeconds: Math.floor((Date.now() - bootTime) / 1000),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    checks: {
      website: "operational",
      intakeForms: emailConfigured ? "operational" : "degraded",
      aiCore: aiCoreStatus,
      database: isSupabaseEnabled() ? "operational" : "local-fallback",
    },
    aiCoreDetail: ollamaHealth.configured ? {
      model: ollamaHealth.model,
      successRate: ollamaHealth.successRate,
      consecutiveFailures: ollamaHealth.consecutiveFailures,
      avgLatencyMs: ollamaHealth.avgLatencyMs,
      lastError: ollamaHealth.lastError,
      lastErrorAt: ollamaHealth.lastErrorAt,
    } : null,
  });
});