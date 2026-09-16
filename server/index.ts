/* Node bootstrap for the Cortex marketing backend (Render, Docker, local).
 *
 * The Cloudflare deployment does not use this file — see `worker/index.ts`.
 */

import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setStaticDir } from "./assets";
import { createApp } from "./app";
import { loadConfig } from "./config";
import { getSupabaseAdmin } from "./services/supabase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = loadConfig();
if (config.isProduction) getSupabaseAdmin();

process.on("unhandledRejection", (reason) => console.error("[server] unhandledRejection:", reason));
process.on("uncaughtException", (err) => console.error("[server] uncaughtException:", err));

const staticPath = path.resolve(__dirname, "public");
setStaticDir(staticPath);

const app = createApp({ runtime: "node", staticPath });

const server = createServer(app);
server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("[server] listen error:", err);
  process.exit(1);
});
server.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}/`));
