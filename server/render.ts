import { readFileSync } from "fs";
import path from "path";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, canonicalUrl, routeMeta } from "../shared/site";

type RenderOptions = { staticPath: string; pathname: string };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&]/g, (character) => ({ "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" }[character] || character));
}

function replaceMeta(html: string, attribute: string, value: string, content: string): string {
  const pattern = new RegExp(`<meta\\s+${attribute}=["'][^"']+["']\\s+content=["'][^"']*["']\\s*/?>`, "i");
  return html.replace(pattern, `<meta ${attribute}="${escapeHtml(value)}" content="${escapeHtml(content)}" />`);
}

function replacePropertyMeta(html: string, property: string, content: string): string {
  return replaceMeta(html, "property", property, content);
}

function replaceNameMeta(html: string, name: string, content: string): string {
  return replaceMeta(html, "name", name, content);
}

function routeStructuredData(pathname: string, title: string, description: string, url: string) {
  const base = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
  if (pathname.startsWith("/products/")) {
    return [
      base,
      { "@context": "https://schema.org", "@type": "SoftwareApplication", name: title.split(" — ")[0].split(" | ")[0], description, applicationCategory: "BusinessApplication", url },
    ];
  }
  return [base];
}

export function createNoScriptSummary(pathname: string, title: string, description: string): string {
  if (pathname === "/404") return `<main><h1>Page not found</h1><p>${escapeHtml(description)}</p></main>`;
  return `<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p><a href="/">Cortex home</a></p></main>`;
}

export function renderRouteHtml({ staticPath, pathname }: RenderOptions): string {
  const template = readFileSync(path.join(staticPath, "index.html"), "utf8");
  const meta = routeMeta(pathname);
  const url = canonicalUrl(pathname, process.env.SITE_URL?.trim() || SITE_URL);
  const ogImage = `${(process.env.SITE_URL?.trim() || SITE_URL).replace(/\/$/, "")}/images/hero-field-poster.jpg`;

  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceNameMeta(html, "description", meta.description);
  html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(url)}" />`);
  html = replacePropertyMeta(html, "og:title", meta.title);
  html = replacePropertyMeta(html, "og:description", meta.description);
  html = replacePropertyMeta(html, "og:url", url);
  html = replacePropertyMeta(html, "og:image", ogImage);
  html = replaceNameMeta(html, "twitter:title", meta.title);
  html = replaceNameMeta(html, "twitter:description", meta.description);
  html = replaceNameMeta(html, "twitter:image", ogImage);

  html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>.*?<\/script>/gis, "");
  const jsonLd = routeStructuredData(pathname, meta.title, meta.description, url)
    .map((entry) => `<script type="application/ld+json">${safeJson(entry)}</script>`)
    .join("");
  html = html.replace("</head>", `${jsonLd}\n</head>`);

  const noScript = `<noscript>${createNoScriptSummary(pathname, meta.title, meta.description)}</noscript>`;
  html = html.replace(/<div id=["']root["']><\/div>/i, `${noScript}\n<div id="root"></div>`);
  return html;
}

export function isKnownRoute(pathname: string): boolean {
  return routeMeta(pathname).path === pathname && routeMeta(pathname).sitemap || pathname === "/404";
}
