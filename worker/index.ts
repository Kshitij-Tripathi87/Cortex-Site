/* Cloudflare Worker entry point for Cortex Site.
 *
 * The marketing backend is an Express app. Workers has supported node:http
 * server modules since the 2025-09-01 compatibility date (and ours enables
 * them), so the same app that boots under `node dist/index.js` runs here
 * unchanged — the only swap is that requests arrive through
 * `handleAsNodeRequest` instead of a listening TCP socket.
 *
 * Routing: the platform serves real files from `dist/public` before the Worker
 * runs. Everything that is not a file (every page route, every /api call)
 * reaches this Worker, which server-renders route metadata into the built
 * index.html.
 */

import { createServer, type Server } from "node:http";
import { handleAsNodeRequest } from "cloudflare:node";
import { setAssetFetcher, type AssetFetcher } from "../server/assets";
import { createApp } from "../server/app";

/** Arbitrary in-isolate port — the socket never leaves the Worker. */
const PORT = 8080;

type Env = { ASSETS: AssetFetcher };

let serverPromise: Promise<Server> | null = null;
let bootError: unknown = null;

function startServer(): Promise<Server> {
  // `listen()` is asynchronous: the port is only routable once "listening"
  // fires, so the first request waits for it.
  return new Promise<Server>((resolve, reject) => {
    const instance = createServer(createApp({ runtime: "worker" }));
    instance.once("listening", () => resolve(instance));
    instance.once("error", reject);
    instance.listen(PORT);
  });
}

function getServer(): Promise<Server> {
  if (bootError) return Promise.reject(bootError);
  if (!serverPromise) {
    // Configuration errors (missing Supabase/Resend values, for example) are
    // cached and surfaced as a 503 instead of crashing the isolate at boot.
    serverPromise = startServer().catch((error) => {
      bootError = error;
      console.error("[worker] failed to start app:", error);
      throw error;
    });
  }
  return serverPromise;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    setAssetFetcher(env.ASSETS);
    try {
      // The port form is required: Workers' node:http does not populate
      // `server.address()`, so the server object cannot be resolved to a port.
      await getServer();
      return await handleAsNodeRequest(PORT, request);
    } catch (error) {
      console.error("[worker] request failed:", error);
      return new Response("Service temporarily unavailable.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
