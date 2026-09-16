/* Express application shared by every runtime.
 *
 * Both the Node server (`server/index.ts`) and the Cloudflare Worker
 * (`worker/index.ts`) build their app here so routes, middleware and server
 * rendering stay in one place. The only runtime difference is static file
 * delivery: Node serves `dist/public` with `express.static`, while Workers
 * serves it from the platform's static-asset layer (and therefore must not
 * mount `express.static`, which needs a filesystem).
 */

import express from "express";
import path from "node:path";
import { resolveRedirect } from "../shared/site";
import { jsonErrorHandler, requestId, securityHeaders } from "./middleware/security";
import { startRateLimitPruning } from "./middleware/rateLimit";
import { startSessionPruning } from "./routes/admin";
import { loadConfig } from "./config";
import { getSupabaseAdmin } from "./services/supabase";
import { isKnownRoute, renderRouteHtml } from "./render";
import { readTextAsset } from "./assets";
import { adminRouter } from "./routes/admin";
import { aiRouter } from "./routes/ai";
import { analyticsRouter } from "./routes/analytics";
import { contactRouter } from "./routes/contact";
import { contentRouter } from "./routes/content";
import { demoRouter } from "./routes/demo";
import { newsletterRouter } from "./routes/newsletter";
import { statusRouter } from "./routes/status";
import { waitlistRouter } from "./routes/waitlist";

export type AppRuntime = "node" | "worker";

export type CreateAppOptions = {
  runtime?: AppRuntime;
  /** Directory holding the built client — required for the Node runtime. */
  staticPath?: string;
};

export function createApp({ runtime = "node", staticPath }: CreateAppOptions = {}): express.Express {
  const config = loadConfig();

  // Background sweeps start here (not at module scope) so the Workers runtime
  // never sees a timer created in the global scope.
  startRateLimitPruning();
  startSessionPruning();

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(requestId);
  app.use(securityHeaders);
  app.use(express.json({ limit: "100kb" }));
  app.use(jsonErrorHandler);

  app.get("/api/health", async (_req, res) => {
    if (!config.isProduction) {
      res.status(200).json({ status: "ok", timestamp: new Date().toISOString(), checks: { app: "ok" } });
      return;
    }
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) throw new Error("supabase_not_initialized");
      const { error } = await supabase.from("site_settings").select("key").limit(1);
      if (error) throw error;
      res.status(200).json({ status: "ok", timestamp: new Date().toISOString(), checks: { app: "ok", supabase: "ok" } });
    } catch (error) {
      console.error("[health] dependency check failed:", error instanceof Error ? error.message : String(error));
      res.status(503).json({ status: "unhealthy", timestamp: new Date().toISOString(), checks: { app: "ok", supabase: "unhealthy" } });
    }
  });

  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const destination = resolveRedirect(req.path);
    if (destination) {
      res.redirect(301, destination);
      return;
    }
    next();
  });

  app.use("/api", contactRouter);
  app.use("/api", waitlistRouter);
  app.use("/api", demoRouter);
  app.use("/api", newsletterRouter);
  app.use("/api", aiRouter);
  app.use("/api", analyticsRouter);
  app.use("/api", contentRouter);
  app.use("/api", statusRouter);
  app.use("/api", adminRouter);

  app.use(cacheTuner);
  // Workers serve static assets before the Worker runs, so `express.static`
  // (which reads from disk) is only mounted where a filesystem exists.
  // `index: false` keeps `/` on the server-rendered path below instead of
  // letting static file handling answer it with the un-rendered template.
  if (runtime === "node" && staticPath) app.use(express.static(staticPath, { etag: true, index: false }));
  app.use("/api", (_req, res) => res.status(404).json({ error: "not found" }));

  app.get("*", async (req, res, next) => {
    const known = isKnownRoute(req.path);
    const pathname = known ? req.path : "/404";
    try {
      const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
      const template = await readTextAsset("/index.html", origin);
      res.status(known ? 200 : 404).send(renderRouteHtml({ template, pathname }));
    } catch (error) {
      next(error);
    }
  });

  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[server] request error:", err);
    if (req.path.startsWith("/api/")) {
      res.status(500).json({ error: "internal" });
      return;
    }
    if (!res.headersSent) res.status(500).type("text/plain").send("Internal server error");
  });

  return app;
}

function cacheTuner(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const base = path.basename(req.path);
  let desired: string | undefined;
  if (base === "index.html" || base === "sitemap.xml" || base === "robots.txt") desired = "no-cache";
  else if (/[-_.][A-Za-z0-9_-]{6,}\./.test(base)) desired = "public, max-age=31536000, immutable";
  if (!desired) return next();
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = ((name: string, value: number | string | string[]) => {
    if (name.toLowerCase() === "cache-control") return originalSetHeader("Cache-Control", desired!);
    return originalSetHeader(name, value as never);
  }) as typeof res.setHeader;
  next();
}
