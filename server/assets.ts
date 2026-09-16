/* Server-side access to built client assets.
 *
 * The Node server reads the built template from disk. A Cloudflare Worker has
 * no filesystem, so it reads the exact same file through the Workers Assets
 * binding instead. Both paths sit behind one lookup so `render` stays
 * runtime-agnostic and never imports `node:fs` in the Worker bundle.
 */

export type AssetFetcher = {
  fetch(input: string | URL | Request, init?: RequestInit): Promise<Response>;
};

let assetFetcher: AssetFetcher | null = null;
let staticDir: string | null = null;
const templateCache = new Map<string, string>();

/** Workers runtime: read assets through the `ASSETS` binding. */
export function setAssetFetcher(fetcher: AssetFetcher | null): void {
  assetFetcher = fetcher;
  templateCache.clear();
}

/** Node runtime: read assets from the directory `vite build` wrote to. */
export function setStaticDir(dir: string | null): void {
  staticDir = dir;
  templateCache.clear();
}

/**
 * Reads a built asset as text.
 *
 * Templates are cached because build output is immutable for the lifetime of
 * the process (Node) or isolate (Workers), which keeps server rendering to a
 * single asset lookup per route.
 */
export async function readTextAsset(pathname: string, origin: string): Promise<string> {
  const cached = templateCache.get(pathname);
  if (cached !== undefined) return cached;

  let contents: string;

  if (assetFetcher) {
    const response = await assetFetcher.fetch(new Request(new URL(pathname, origin)));
    if (!response.ok) throw new Error(`asset ${pathname} unavailable (${response.status})`);
    contents = await response.text();
  } else if (staticDir) {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    contents = await readFile(join(staticDir, pathname), "utf8");
  } else {
    throw new Error("no asset source configured: set an asset fetcher (Workers) or a static dir (Node)");
  }

  templateCache.set(pathname, contents);
  return contents;
}

/** Test-only hook. */
export function __resetAssetsForTests(): void {
  assetFetcher = null;
  staticDir = null;
  templateCache.clear();
}
