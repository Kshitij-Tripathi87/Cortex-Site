/* Ambient types for the `cloudflare:*` modules the Worker entry uses.
 *
 * Hand-written rather than generated so `pnpm check` works from a clean
 * checkout without a `wrangler types` step.
 */

declare module "cloudflare:node" {
  import type { Server } from "node:http";

  /**
   * Routes a Workers `Request` through a Node.js HTTP server.
   * Accepts a server instance or the port a server is already listening on.
   */
  export function handleAsNodeRequest(
    server: Server | number,
    request: Request,
    options?: { hostname?: string },
  ): Promise<Response>;

  /** Wraps a Node.js HTTP server as a Workers default export. */
  export function httpServerHandler(server: Server | number): { fetch(request: Request): Promise<Response> };
}
