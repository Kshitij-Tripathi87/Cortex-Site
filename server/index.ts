import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;
// `dist/index.js` is the bundle, so static assets are always next to it
// at `dist/public`. The previous dual-path (dev vs prod) branch was a
// Manus-scaffold leftover and is no longer needed.
const staticPath = path.resolve(__dirname, "public");

process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] uncaughtException:", err);
});

const app = express();

// Small JSON body cap; the SPA does not currently POST anything, but the
// 404 fallback below treats /api/* as JSON, so keep a strict limit on
// accidental misuse.
app.use(express.json({ limit: "100kb" }));

// Conservative security headers. CSP is left to the host (e.g. Cloudflare)
// because the marketing site currently pulls Google Fonts cross-origin.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// Override the `Cache-Control` that `send` (used internally by
// express.static) sets to `public, max-age=0` for every served file.
// We intercept `res.setHeader` so that the override applies even when
// the downstream middleware streams the response without going through
// `res.writeHead`.
function cacheTuner(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const base = path.basename(req.path);
  let desired: string | undefined;
  if (base === "index.html") {
    desired = "no-cache";
  } else if (/[-_.][A-Za-z0-9_-]{6,}\./.test(base)) {
    desired = "public, max-age=31536000, immutable";
  }
  if (!desired) return next();

  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = ((name: string, value: number | string | string[]) => {
    if (typeof name === "string" && name.toLowerCase() === "cache-control") {
      return originalSetHeader("Cache-Control", desired!);
    }
    return originalSetHeader(name, value as never);
  }) as typeof res.setHeader;
  next();
}

app.use(cacheTuner);
app.use(express.static(staticPath, { etag: true }));

// Surface real 404s for any future /api/* surface so a typo never silently
// renders the SPA. This must come before the SPA fallback.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not found" });
});

// SPA fallback for client-side routes.
app.get("*", (_req, res, next) => {
  res.sendFile(path.join(staticPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

// Final error handler — turns anything that escapes into a clean 5xx JSON
// when the request looked like an API call, and a plain 500 otherwise.
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] request error:", err);
  if (req.path.startsWith("/api/")) {
    res.status(500).json({ error: "internal" });
    return;
  }
  if (!res.headersSent) {
    res.status(500).type("text/plain").send("Internal server error");
  }
});

const server = createServer(app);

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[server] port ${port} is already in use`);
  } else {
    console.error("[server] listen error:", err);
  }
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
