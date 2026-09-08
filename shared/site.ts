/* Silverline Systems reminder: the site map is part of the product story. One IA
 * definition drives navigation, sitemap, redirects, and SEO metadata so they can
 * never drift apart. */

export const SITE_NAME = "Cortex";
export const SITE_TAGLINE = "Clarity for critical systems.";
export const SITE_DESCRIPTION =
  "Cortex is the intelligence layer for teams building critical systems — turn complex signals into confident decisions.";
export const SITE_LOCALE = "en_US";
export const SITE_TWITTER_HANDLE = "@cortex";

/** Canonical origin. Override with SITE_URL in production (e.g. https://cortex.com). */
export const SITE_URL = "https://cortex.systems";

export type SiteRoute = {
  path: string;
  title: string;
  description: string;
  /** Include in sitemap.xml. */
  sitemap: boolean;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
};

/**
 * Marketing information architecture (Cortex Marketing Platform v1).
 * Products keep their current names: Workflo, Nexus, ASTRA.
 */
export const SITE_ROUTES: SiteRoute[] = [
  { path: "/", title: "Cortex — Clarity for critical systems", description: SITE_DESCRIPTION, sitemap: true, changefreq: "weekly", priority: 1 },
  { path: "/products", title: "Products — Cortex", description: "Workflo, Nexus, and ASTRA. Three products, one intelligence layer for critical systems.", sitemap: true, changefreq: "weekly", priority: 0.9 },
  { path: "/products/workflo", title: "Workflo — See the system, not just the signal | Cortex", description: "Workflo brings fragmented operational data into one continuously legible view, in early access now.", sitemap: true, changefreq: "monthly", priority: 0.8 },
  { path: "/products/nexus", title: "Nexus — From insight to action with context | Cortex", description: "Nexus turns a complex question into an evidence-backed decision path. Coming soon.", sitemap: true, changefreq: "monthly", priority: 0.8 },
  { path: "/products/astra", title: "ASTRA — Make the better way repeatable | Cortex", description: "ASTRA codifies proven operating patterns into governed workflows. Coming soon.", sitemap: true, changefreq: "monthly", priority: 0.8 },
  { path: "/platform", title: "Platform — The intelligence layer beneath the work | Cortex", description: "Connect the systems you already trust. Give every team the context to move.", sitemap: true, changefreq: "monthly", priority: 0.9 },
  { path: "/solutions", title: "Solutions — Cortex", description: "Operating patterns for teams running complex, consequential systems.", sitemap: true, changefreq: "monthly", priority: 0.7 },
  { path: "/industries", title: "Industries — Cortex", description: "How healthcare, financial, and industrial teams use Cortex to decide with confidence.", sitemap: true, changefreq: "monthly", priority: 0.7 },
  { path: "/security", title: "Security & Trust — Cortex", description: "Security, permissions, and an auditable operating model, enterprise-grade by design.", sitemap: true, changefreq: "monthly", priority: 0.7 },
  { path: "/resources", title: "Resources — Cortex", description: "Case studies, insights, and field notes from the Cortex desk.", sitemap: true, changefreq: "weekly", priority: 0.7 },
  { path: "/resources/case-studies", title: "Case Studies — Cortex", description: "Selected stories: how teams moved from signal to decision with Cortex.", sitemap: true, changefreq: "monthly", priority: 0.7 },
  { path: "/resources/insights", title: "Insights — Cortex", description: "Ideas for the next system, from the Cortex desk.", sitemap: true, changefreq: "weekly", priority: 0.6 },
  { path: "/resources/blog", title: "Blog — Cortex", description: "Field notes and perspectives on intelligent operations.", sitemap: true, changefreq: "weekly", priority: 0.6 },
  { path: "/case-study/northstar-health", title: "Northstar Health — A shared language for complexity | Cortex", description: "How Northstar Health built one shared operating picture across sites.", sitemap: true, changefreq: "yearly", priority: 0.6 },
  { path: "/case-study/vela-financial", title: "Vela Financial — A living risk picture | Cortex", description: "How Vela Financial replaced weekly reconciliation with trusted, living context.", sitemap: true, changefreq: "yearly", priority: 0.6 },
  { path: "/case-study/aster-works", title: "Aster Works — Confidence while the window is open | Cortex", description: "How Aster Works makes faster cross-site decisions with Cortex.", sitemap: true, changefreq: "yearly", priority: 0.6 },
  { path: "/pricing", title: "Pricing — Cortex", description: "Pilot, Platform, and Enterprise paths. Start with a working session.", sitemap: true, changefreq: "monthly", priority: 0.6 },
  { path: "/company", title: "Company — Cortex", description: "Built for the moments that matter. Insights, investor center, and press.", sitemap: true, changefreq: "monthly", priority: 0.5 },
  { path: "/contact", title: "Contact — Talk to Cortex", description: "Bring us the hard question. We’ll make the first conversation useful.", sitemap: true, changefreq: "yearly", priority: 0.6 },
  { path: "/demo", title: "Book a Demo — Cortex", description: "Walk through one decision your team needs to make better.", sitemap: true, changefreq: "yearly", priority: 0.6 },
  { path: "/docs", title: "Documentation — Cortex", description: "Platform foundations, building with Cortex, and trust & governance.", sitemap: true, changefreq: "weekly", priority: 0.6 },
  { path: "/legal", title: "Legal — Cortex", description: "Privacy, terms, cookies, acceptable use, and AI terms.", sitemap: true, changefreq: "yearly", priority: 0.3 },
  { path: "/legal/privacy", title: "Privacy Policy — Cortex", description: "How Cortex collects, uses, and protects personal information.", sitemap: true, changefreq: "yearly", priority: 0.3 },
  { path: "/legal/terms", title: "Terms of Service — Cortex", description: "The terms governing use of the Cortex website and services.", sitemap: true, changefreq: "yearly", priority: 0.3 },
  { path: "/legal/acceptable-use", title: "Acceptable Use Policy — Cortex", description: "What is and isn’t acceptable when using Cortex.", sitemap: true, changefreq: "yearly", priority: 0.2 },
  { path: "/legal/cookies", title: "Cookie Policy — Cortex", description: "How Cortex uses cookies and similar technologies, and your choices.", sitemap: true, changefreq: "yearly", priority: 0.2 },
  { path: "/legal/ai-terms", title: "AI Terms — Cortex", description: "Terms specific to Cortex AI features, including AI Core.", sitemap: true, changefreq: "yearly", priority: 0.2 },
  { path: "/status", title: "Status — Cortex", description: "Live operating status of Cortex systems.", sitemap: false },
  { path: "/sales", title: "Sales — Bring us the hard question | Cortex", description: "Talk to the Cortex team about your operating context.", sitemap: false },
];

export function routeMeta(path: string): SiteRoute {
  return (
    SITE_ROUTES.find((route) => route.path === path) ?? {
      path,
      title: "Cortex — Clarity for critical systems",
      description: SITE_DESCRIPTION,
      sitemap: false,
    }
  );
}

export function canonicalUrl(path: string, origin = SITE_URL): string {
  const clean = path.split("#")[0].split("?")[0] || "/";
  return `${origin.replace(/\/$/, "")}${clean === "/" ? "/" : clean}`;
}

/* ------------------------------------------------------------------ */
/* Redirects (legacy → canonical). Enforced server-side (301) with a   */
/* client-side fallback for static hosting.                            */
/* ------------------------------------------------------------------ */

export const REDIRECTS: Record<string, string> = {
  "/product": "/products",
  "/product/workflo": "/products/workflo",
  "/product/nexus": "/products/nexus",
  "/product/astra": "/products/astra",
  // Legacy internal names, in case they were ever linked or indexed.
  "/product/sense": "/products/workflo",
  "/product/decide": "/products/nexus",
  "/product/scale": "/products/astra",
  "/products/sense": "/products/workflo",
  "/products/decide": "/products/nexus",
  "/products/scale": "/products/astra",
  "/resources/case-studies/northstar-health": "/case-study/northstar-health",
  "/resources/case-studies/vela-financial": "/case-study/vela-financial",
  "/resources/case-studies/aster-works": "/case-study/aster-works",
};

export function resolveRedirect(path: string): string | null {
  return REDIRECTS[path] ?? null;
}

/* ------------------------------------------------------------------ */
/* Navigation + footer                                                 */
/* ------------------------------------------------------------------ */

export const PRIMARY_NAV = [
  { label: "Platform", href: "/platform" },
  { label: "Products", href: "/products" },
  { label: "Solutions", href: "/solutions" },
  { label: "Resources", href: "/resources" },
  { label: "Company", href: "/company" },
] as const;

export const PRODUCT_NAV = [
  { label: "Workflo", href: "/products/workflo" },
  { label: "Nexus", href: "/products/nexus" },
  { label: "ASTRA", href: "/products/astra" },
] as const;

export const FOOTER_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Platform",
    links: [
      { label: "Platform overview", href: "/platform" },
      { label: "Solutions", href: "/solutions" },
      { label: "Industries", href: "/industries" },
      { label: "Security", href: "/security" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Products",
    links: [
      { label: "Workflo", href: "/products/workflo" },
      { label: "Nexus", href: "/products/nexus" },
      { label: "ASTRA", href: "/products/astra" },
      { label: "All products", href: "/products" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Case studies", href: "/resources/case-studies" },
      { label: "Insights", href: "/resources/insights" },
      { label: "Blog", href: "/resources/blog" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Contact", href: "/contact" },
      { label: "Book a demo", href: "/demo" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Acceptable use", href: "/legal/acceptable-use" },
      { label: "AI terms", href: "/legal/ai-terms" },
    ],
  },
];
