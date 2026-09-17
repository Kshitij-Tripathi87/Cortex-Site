/* Silverline Systems reminder: detail content should read like an operating brief—specific, evidence-led, and organized by indexed systems language. */

/*
 * The product and case-study content now lives in the shared catalog
 * (`@shared/catalog`), which is the single source of truth for the client and
 * the server prerenderer. This module re-exports it so existing page imports
 * (`@/lib/cortexContent`) keep resolving to the same shape.
 */
export { products, caseStudies } from "@shared/catalog";
export type { ProductDetail, CaseStudyDetail } from "@shared/catalog";
