import { SITE_NAME, SITE_ROUTES, SITE_URL, canonicalUrl, routeMeta } from "../shared/site";

function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character)); }
function safeJson(value: unknown): string { return JSON.stringify(value).replace(/[<>&]/g, (character) => ({ "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" }[character] || character)); }
function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/**
 * Sets a `<meta>` tag, matching on its identifying attribute
 * (`name="description"`, `property="og:title"`) and inserting it before
 * `</head>` when the template does not carry one.
 *
 * Matching on the value matters. The previous version replaced "the first tag
 * with a `name` attribute", so each call overwrote <meta name="viewport"> and
 * left every route shipping the template's default description.
 */
function replaceMeta(html: string, attribute: string, value: string, content: string): string {
  const tag = `<meta ${attribute}="${escapeHtml(value)}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${escapeRegExp(value)}["'][^>]*>`, "i");
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

/** Same contract as `replaceMeta` for `<link rel="...">` tags. */
function replaceLink(html: string, rel: string, href: string): string {
  const tag = `<link rel="${rel}" href="${escapeHtml(href)}" />`;
  const pattern = new RegExp(`<link\\s+rel=["']${escapeRegExp(rel)}["'][^>]*>`, "i");
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}
function structuredData(pathname: string, title: string, description: string, url: string) {
  const page = { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url, isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL } };
  if (pathname.startsWith("/products/")) return [page, { "@context": "https://schema.org", "@type": "SoftwareApplication", name: title.split(" — ")[0].split(" | ")[0], description, applicationCategory: "BusinessApplication", url }];
  return [page];
}
export function createNoScriptSummary(pathname: string, title: string, description: string): string {
  if (pathname === "/404") return `<main><h1>Page not found</h1><p>${escapeHtml(description)}</p></main>`;
  return `<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p><a href="/">Cortex home</a></p></main>`;
}
/**
 * Injects per-route metadata into the built `index.html`.
 *
 * The template is passed in rather than read here so this module works on both
 * Node (filesystem) and Cloudflare Workers (Assets binding).
 */
export function renderRouteHtml({ template, pathname }: { template: string; pathname: string }): string {
  const meta = routeMeta(pathname);
  const origin = process.env.SITE_URL?.trim() || SITE_URL;
  const url = canonicalUrl(pathname, origin);
  const ogImage = `${origin.replace(/\/$/, "")}/images/hero-field-poster.jpg`;
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceMeta(html, "name", "description", meta.description);
  html = replaceLink(html, "canonical", url);
  html = replaceMeta(html, "property", "og:title", meta.title);
  html = replaceMeta(html, "property", "og:description", meta.description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "property", "og:image", ogImage);
  html = replaceMeta(html, "name", "twitter:title", meta.title);
  html = replaceMeta(html, "name", "twitter:description", meta.description);
  html = replaceMeta(html, "name", "twitter:image", ogImage);
  html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");
  const jsonLd = structuredData(pathname, meta.title, meta.description, url).map((entry) => `<script type="application/ld+json">${safeJson(entry)}</script>`).join("");
  html = html.replace("</head>", `${jsonLd}\n</head>`);
  return html.replace(/<div id=["']root["']><\/div>/i, `<noscript>${createNoScriptSummary(pathname, meta.title, meta.description)}</noscript>\n<div id="root"></div>`);
}
export function isKnownRoute(pathname: string): boolean { return SITE_ROUTES.some((route) => route.path === pathname); }
