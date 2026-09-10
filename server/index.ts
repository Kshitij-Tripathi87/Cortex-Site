/* Cortex marketing backend — intake desk for the public site. */

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { resolveRedirect } from "../shared/site";
import { jsonErrorHandler, requestId, securityHeaders } from "./middleware/security";
import { loadConfig } from "./config";
import { getSupabaseAdmin } from "./services/supabase";
import { renderRouteHtml, isKnownRoute } from "./render";
import { adminRouter } from "./routes/admin";
import { aiRouter } from "./routes/ai";
import { analyticsRouter } from "./routes/analytics";
import { contactRouter } from "./routes/contact";
import { contentRouter } from "./routes/content";
import { demoRouter } from "./routes/demo";
import { newsletterRouter } from "./routes/newsletter";
import { statusRouter } from "./routes/status";
import { waitlistRouter } from "./routes/waitlist";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = loadConfig();
if (config.isProduction) getSupabaseAdmin();
const port = config.port;
const staticPath = path.resolve(__dirname, "public");

process.on("unhandledRejection", (reason) => console.error("[server] unhandledRejection:", reason));
process.on("uncaughtException", (err) => console.error("[server] uncaughtException:", err));

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
  if (destination) { res.redirect(301, destination); return; }
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

app.use(cacheTuner);
app.use(express.static(staticPath, { etag: true }));
app.use("/api", (_req, res) => res.status(404).json({ error: "not found" }));

app.get("*", (req, res, next) => {
  if (!isKnownRoute(req.path)) {
    try { res.status(404).send(renderRouteHtml({ staticPath, pathname: "/404" })); }
    catch (error) { next(error); }
    return;
  }
  try { res.status(200).send(renderRouteHtml({ staticPath, pathname: req.path })); }
  catch (error) { next(error); }
});

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] request error:", err);
  if (req.path.startsWith("/api/")) { res.status(500).json({ error: "internal" }); return; }
  if (!res.headersSent) res.status(500).type("text/plain").send("Internal server error");
});

const server = createServer(app);
server.on("error", (err: NodeJS.ErrnoException) => { console.error("[server] listen error:", err); process.exit(1); });
server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
