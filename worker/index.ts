/**
 * Cortex Worker — Cloudflare edge entry point.
 *
 * Layers:
 *   1. Security headers on every response
 *   2. API routes (contact / waitlist / ai chat) with the exact Express contract
 *   3. Static assets from the Cloudflare Static Assets binding
 *   4. SPA fallback (index.html) for unknown GET routes
 *
 * Deploy: `wrangler deploy` after `pnpm build`.
 */

import { handleAiChat, handleContact, handleWaitlist, type WorkerEnv } from "./routes/api";
import { buildRobots, buildSitemap } from "./seo";

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

function withSecurityHeaders(response: Response): Response {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...securityHeaders },
  });
}

// Simple in-memory rate limit per IP for login-style abuse windows.
// Workers are stateless across isolates; this is a best-effort guard and the
// production hardening path moves this to Cloudflare KV or Durable Objects.
const rateBuckets = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 30;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_MAX;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    try {
      // API routes
      if (url.pathname.startsWith("/api/")) {
        if (rateLimited(`${ip}:${url.pathname}`)) {
          return json({ error: "Too many requests. Please try again later." }, 429);
        }

        if (url.pathname === "/api/contact" && request.method === "POST") {
          return await handleContact(env, request);
        }
        if (url.pathname === "/api/waitlist" && request.method === "POST") {
          return await handleWaitlist(env, request);
        }
        if (url.pathname === "/api/ai/chat" && request.method === "POST") {
          return await handleAiChat(env, request);
        }
        return json({ error: "not found" }, 404);
      }

      // SEO endpoints
      if (url.pathname === "/robots.txt") {
        return new Response(buildRobots(url.origin), {
          headers: { "Content-Type": "text/plain", ...securityHeaders },
        });
      }
      if (url.pathname === "/sitemap.xml") {
        return new Response(buildSitemap(url.origin, new Date().toISOString().slice(0, 10)), {
          headers: { "Content-Type": "application/xml", ...securityHeaders },
        });
      }

      // Static assets via the assets binding; fall through to SPA shell.
      return withSecurityHeaders(env.ASSETS ? await env.ASSETS.fetch(request) : new Response("Static assets not bound", { status: 500 }));
    } catch (err) {
      console.error("[worker] request error:", err);
      if (url.pathname.startsWith("/api/")) return json({ error: "internal" }, 500);
      return new Response("Internal server error", { status: 500, headers: securityHeaders });
    }
  },
};
