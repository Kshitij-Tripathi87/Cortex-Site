/* Silverline Systems reminder: every route earns its metadata — title, description,
 * canonical, social card, and structured data. No route ships with defaults. */

import { useEffect } from "react";
import { canonicalUrl, routeMeta, SITE_NAME } from "@shared/site";

type SEOProps = {
  path: string;
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export default function SEO({ path, title, description, image, noIndex, jsonLd }: SEOProps) {
  useEffect(() => {
    const meta = routeMeta(path);
    const resolvedTitle = title ?? meta.title;
    const resolvedDescription = description ?? meta.description;
    const canonical = canonicalUrl(path);
    const cardImage = image ?? `${canonicalUrl("/assets/cortex-hero-machine-intelligence.svg")}`;

    document.title = resolvedTitle;
    document.documentElement.setAttribute("lang", "en");

    upsertMeta("name", "description", resolvedDescription);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);

    // OpenGraph
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", resolvedTitle);
    upsertMeta("property", "og:description", resolvedDescription);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", cardImage);

    // Twitter / X
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", resolvedTitle);
    upsertMeta("name", "twitter:description", resolvedDescription);
    upsertMeta("name", "twitter:image", cardImage);

    // Structured data: exactly one managed script tag, replaced per route.
    document.head.querySelectorAll('script[data-cortex-jsonld]').forEach((node) => node.remove());
    const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    for (const graph of graphs) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-cortex-jsonld", "true");
      script.textContent = JSON.stringify(graph);
      document.head.appendChild(script);
    }
  }, [path, title, description, image, noIndex, jsonLd]);

  return null;
}
