/*
 * Head-level prerendering for the Cortex SPA.
 *
 * The marketing body stays client-rendered; the server only emits the route's
 * semantic head so crawlers and social scrapers see correct title, description,
 * canonical, Open Graph, Twitter, JSON-LD, and a <noscript> summary before the
 * client bundle executes. Unknown routes get a real HTTP 404 with a not-found
 * representation instead of the soft-404 SPA shell.
 */

import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  DEFAULT_SITE_URL,
  absoluteUrl,
  indexablePaths,
  resolveRoute,
  routeMetadata,
  site,
  type ResolvedRoute,
} from "../shared/catalog";

// The server bundle is ESM, so __dirname is not defined; derive it from
// import.meta.url. On the built bundle this resolves to `dist`, so the SPA
// shell lives at `dist/public/index.html`.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(moduleDir, "public", "index.html");

let htmlTemplate: string | null = null;

async function loadTemplate(): Promise<string> {
  if (htmlTemplate) return htmlTemplate;
  htmlTemplate = await readFile(templatePath, "utf8");
  return htmlTemplate;
}

/** Escape a string for safe interpolation into HTML and JSON-LD. */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

function canonical(siteUrl: string): string {
  return (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function buildStructuredData(route: ResolvedRoute, host: string): object | null {
  const org = {
    "@type": "Organization",
    "@id": `${host}/#organization`,
    name: site.name,
    legalName: site.organization,
    url: host,
  };
  const website = {
    "@type": "WebSite",
    "@id": `${host}/#website`,
    url: host,
    name: site.name,
    publisher: { "@id": `${host}/#organization` },
  };

  switch (route.kind) {
    case "home":
      return {
        "@context": "https://schema.org",
        "@graph": [org, website, { "@type": "WebPage", "@id": `${host}/#webpage`, url: `${host}/`, name: `${site.name} — ${site.tagline}`, isPartOf: { "@id": `${host}/#website` } }],
      };
    case "product": {
      const product = route.product;
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        url: absoluteUrl(route.path, host),
        brand: { "@type": "Brand", name: site.name },
        manufacturer: org,
      };
    }
    case "case-study": {
      const story = route.caseStudy;
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: story.title,
        description: story.overview,
        url: absoluteUrl(route.path, host),
        author: { "@type": "Organization", name: site.name },
        publisher: org,
        mainEntityOfPage: absoluteUrl(route.path, host),
      };
    }
    case "section":
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: routeMetadata(route)?.title,
        description: routeMetadata(route)?.description,
        url: absoluteUrl(route.path, host),
        isPartOf: { "@id": `${host}/#website` },
      };
    case "product-overview":
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: routeMetadata(route)?.title,
        url: absoluteUrl(route.path, host),
        isPartOf: { "@id": `${host}/#website` },
      };
    case "not-found":
    case "admin":
      return null;
  }
}

function buildHead(route: ResolvedRoute, host: string): { html: string } | null {
  const meta = routeMetadata(route);
  if (!meta) return null;

  const url = absoluteUrl(route.path, host);
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const structured = buildStructuredData(route, host);

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta property="og:type" content="${route.kind === "product" ? "product" : route.kind === "case-study" ? "article" : "website"}" />`,
    `<meta property="og:site_name" content="${site.name}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:url" content="${url}" />`,
    `<meta name="twitter:site" content="@cortex" />`,
  ];

  if (structured) {
    tags.push(`<script type="application/ld+json">${escapeHtml(JSON.stringify(structured))}</script>`);
  }

  return { html: tags.join("\n    ") };
}

/** Inject a prebuilt head block (including <title>) and a <noscript> summary. */
function injectHead(template: string, head: string, noscript: string): string {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, head.split("\n    ")[0]);
  const rest = head.split("\n    ").slice(1).join("\n    ");
  html = html.replace("</head>", `    ${rest}\n\n    <noscript>${noscript}</noscript>\n  </head>`);
  return html;
}

/** Render a full HTML document for a known, indexable route. */
export async function renderRoute(pathname: string, siteUrl: string): Promise<{ html: string; status: number } | null> {
  const host = canonical(siteUrl);
  const route = resolveRoute(pathname);
  if (!route) return null;
  const built = buildHead(route, host);
  if (!built) return null; // admin — noindex

  const meta = routeMetadata(route)!;
  const template = await loadTemplate();
  return { html: injectHead(template, built.html, escapeHtml(meta.noscript)), status: 200 };
}

/** Render a 404 document: a real 404 with a noindex head and the SPA shell. */
export async function renderNotFound(siteUrl: string): Promise<{ html: string; status: number }> {
  const host = canonical(siteUrl);
  const route = resolveRoute("/404");
  const meta = route ? routeMetadata(route) : null;
  const title = escapeHtml(meta?.title ?? "Page not found");
  const description = escapeHtml(meta?.description ?? "The page you are looking for does not exist.");
  const noscript = escapeHtml(meta?.noscript ?? `${site.name} — page not found. Return to the home page.`);

  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="noindex" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
  ].join("\n    ");

  const template = await loadTemplate();
  return { html: injectHead(template, head, noscript), status: 404 };
}

/** Build robots.txt. */
export function buildRobots(siteUrl: string): string {
  const host = canonical(siteUrl);
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /admin/",
    `Sitemap: ${host}/sitemap.xml`,
    "",
  ].join("\n");
}

/** Build the XML sitemap from the indexable paths. */
export function buildSitemap(siteUrl: string, lastModified: string): string {
  const host = canonical(siteUrl);
  const urls = indexablePaths()
    .map((path) => {
      const url = absoluteUrl(path, host);
      return `<url>\n      <loc>${escapeHtml(url)}</loc>\n      <lastmod>${escapeHtml(lastModified)}</lastmod>\n      <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>\n    </url>`;
    })
    .join("\n    ");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n    ${urls}\n  </urlset>\n`;
}
