/* Silverline Systems reminder: status is a promise kept in public. Report what the
 * marketing site depends on — nothing more, nothing less. */

import { Router } from "express";
import { apiLimiters } from "../middleware/rateLimit";
import { isSupabaseEnabled } from "../services/supabase";

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
      aiCore: process.env.OLLAMA_BASE_URL ? "operational" : "degraded",
      database: isSupabaseEnabled() ? "operational" : "local-fallback",
    },
  });
});
