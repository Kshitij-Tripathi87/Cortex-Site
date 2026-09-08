/* Silverline Systems reminder: trust is a feature. Headers, request IDs, and body
 * limits are the quiet infrastructure every marketing API stands on. */

import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Baseline security headers for a marketing site.
 *
 * CSP notes:
 * - `style-src 'unsafe-inline'` is required: the app sets background images
 *   via inline styles, and Vite injects dev styles the same way.
 * - `img-src https:` allows the editorial photography hosts in use.
 * - No third-party scripts are loaded; analytics is first-party (`/api/*`).
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  if (isProduction) {
    // HSTS only in production — never on localhost/dev.
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "manifest-src 'self'",
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);

  next();
}

/** Attach a request ID for structured logs and error correlation. */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.get("x-request-id");
  const id =
    incoming && /^[A-Za-z0-9-]{1,64}$/.test(incoming) ? incoming : randomUUID();
  (req as Request & { requestId?: string }).requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}

export function getRequestId(req: Request): string {
  return (req as Request & { requestId?: string }).requestId ?? "unknown";
}

/** Friendly JSON error for malformed request bodies. */
export function jsonErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Invalid JSON body.", requestId: getRequestId(req) });
    return;
  }
  next(err);
}
