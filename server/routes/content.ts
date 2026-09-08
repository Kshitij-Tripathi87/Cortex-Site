/* Silverline Systems reminder: content is a seam, not a hardcode. This endpoint
 * serves the publishable snapshot today and becomes the CMS read path when
 * Supabase content goes live — clients never need to change. */

import { Router } from "express";
import { FOOTER_COLUMNS, PRIMARY_NAV, PRODUCT_NAV, SITE_ROUTES } from "../../shared/site";
import { apiLimiters } from "../middleware/rateLimit";
import { getSupabaseAdmin } from "../services/supabase";

export const contentRouter = Router();

type PublicContentRow = {
  slug: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  published_at: string | null;
};

async function publishedContent(type?: string): Promise<PublicContentRow[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    let query = supabase
      .from("content")
      .select("slug,type,title,body,metadata,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    if (error) {
      console.error("[content] Supabase read failed:", error.message);
      return null;
    }
    return (data as PublicContentRow[]) ?? [];
  } catch (error) {
    console.error("[content] Supabase read threw:", error);
    return null;
  }
}

/** Public site snapshot: navigation, routes, and (when live) CMS content. */
contentRouter.get("/content", apiLimiters.read(), async (_req, res) => {
  const cms = await publishedContent();
  res.json({
    ok: true,
    source: cms ? "supabase" : "static",
    nav: PRIMARY_NAV,
    products: PRODUCT_NAV,
    footer: FOOTER_COLUMNS,
    routes: SITE_ROUTES.filter((route) => route.sitemap).map((route) => route.path),
    cms: cms ?? [],
  });
});

/** Published entries of one CMS type (product, case-study, insight, ...). */
contentRouter.get("/content/:type", apiLimiters.read(), async (req, res) => {
  const type = String(req.params.type ?? "").slice(0, 32);
  const allowed = new Set(["product", "case-study", "insight", "resource", "faq", "page", "announcement"]);
  if (!allowed.has(type)) {
    res.status(404).json({ error: "Unknown content type." });
    return;
  }
  const cms = await publishedContent(type);
  res.json({ ok: true, source: cms ? "supabase" : "static", type, entries: cms ?? [] });
});
