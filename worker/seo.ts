/**
 * Edge-safe SEO helpers for the Worker.
 * Mirrors server/prerender.ts robots/sitemap behavior without Node fs imports.
 */

import {
  DEFAULT_SITE_URL,
  absoluteUrl,
  indexablePaths,
} from "../shared/catalog";

function escapeXml(value: string): string {
  const entities: Record<string, string> = {
    "\u0026": "\u0026amp;",
    "\u003C": "\u0026lt;",
    "\u003E": "\u0026gt;",
    "\u0022": "\u0026quot;",
    "'": "\u0026#39;",
  };
  return value.replace(/[&<>"']/g, (c) => entities[c] || c);
}

function canonicalHost(host: string): string {
  return (host || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function buildRobots(siteUrl: string): string {
  const host = canonicalHost(siteUrl);
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /admin/",
    `Sitemap: ${host}/sitemap.xml`,
    "",
  ].join("\n");
}

export function buildSitemap(siteUrl: string, lastModified: string): string {
  const host = canonicalHost(siteUrl);
  const urls = indexablePaths()
    .map((path) => {
      const url = absoluteUrl(path, host);
      return `<url>\n      <loc>${escapeXml(url)}</loc>\n      <lastmod>${escapeXml(lastModified)}</lastmod>\n      <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>\n    </url>`;
    })
    .join("\n    ");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n    ${urls}\n  </urlset>\n`;
}
