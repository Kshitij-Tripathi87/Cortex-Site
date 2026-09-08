# Cortex Marketing Platform v1 — Foundation

This document describes the production foundation: information architecture,
SEO, validation, API surface, storage strategy, security headers, analytics,
and consent. It is the handoff between the original site and the blueprint
phases (visual/motion, backend/CMS, AI Core hardening).

## Information architecture

Canonical routes (see `shared/site.ts`, the single source of truth):

```text
/                               Home
/products                       Product overview (Workflo early access)
/products/workflo|nexus|astra   Product operating briefs
/platform  /solutions  /industries  /security
/resources                      Library overview
/resources/case-studies|insights|blog
/case-study/:slug               Northstar, Vela, Aster
/pricing  /company  /contact  /demo  /docs  /sales
/legal  /legal/privacy|terms|acceptable-use|cookies|ai-terms
/status                         Public status (noindex)
/admin/waitlist                  Private admin (noindex, session-gated)
/404
```

Legacy paths (`/product`, `/product/:slug`, old sense/decide/scale names)
301-redirect server-side to canonical products, with a client-side fallback
in `App.tsx` for static hosting.

## SEO

- `client/src/components/SEO.tsx` sets title, description, canonical,
  OpenGraph, Twitter card, and JSON-LD per route.
- `client/src/lib/seo/structuredData.ts`: Organization, WebSite,
  SoftwareApplication (products), BreadcrumbList, FAQPage (pricing).
- `client/public/sitemap.xml` mirrors `SITE_ROUTES` (sitemap: true);
  `robots.txt` disallows `/api/`, `/admin/`, `/status`, `/404`.
- Base tags live in `client/index.html`; update `SITE_URL` in
  `shared/site.ts` (and the two public files) when the production domain
  is final.

## Validation (Zod everywhere it matters)

`shared/schemas.ts` defines Contact, Waitlist, Demo, Newsletter, AI chat,
Analytics, and Admin login schemas. The client parses before submit
(`ContactPage`, `DemoPage`, newsletter form); the server parses at the
boundary via `validateBody()` middleware. Same schema, both sides.

## Marketing API (`server/routes/`)

```text
POST /api/contact      → email + store (contact_messages)
POST /api/waitlist     → email + store (waitlist_entries)
POST /api/demo         → email + store (demo_requests + leads mirror)
POST /api/newsletter   → store (newsletter_subscribers)
POST /ai/chat ...      → POST /api/ai/chat (grounded + optional Ollama)
POST /api/analytics    → store (analytics_events), always 202
GET  /api/content      → nav/routes snapshot + CMS when live
GET  /api/content/:type→ published CMS entries by type
GET  /api/health       → liveness probe
GET  /api/status       → public status snapshot (drives /status)
POST /api/admin/login|logout, GET /api/admin/session
GET  /api/admin/waitlist|contact|demo|newsletter|analytics (session-gated)
```

Rate limits: writes 12/10min, AI 20/10min, analytics 120/min, reads 120/min
(`server/middleware/rateLimit.ts`), plus the stricter admin-login lockout.

## Storage: Supabase-ready, JSON-backed today

- Schema + RLS + seed live in `supabase/` (see its README).
- `server/services/supabase.ts` returns a service-role client only when
  `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set — otherwise null.
- `server/services/store.ts` always writes local JSON under `data/` and
  mirrors to Supabase when available; reads prefer Supabase, fall back
  to JSON. No lead is ever lost to missing infrastructure.
- There is intentionally no `VITE_SUPABASE_*` variable anywhere.

## Security headers

`server/middleware/security.ts` sets CSP, HSTS (production only),
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`,
`Permissions-Policy`, COOP/CORP, request IDs, and JSON error handling.
`x-powered-by` is disabled. CSP permits Google Fonts + inline styles
(background images) + `https:` images; no third-party scripts.

## Analytics + consent

- First-party events only (`client/src/lib/analytics/events.ts`):
  `page_view`, `hero_cta_clicked`, `product_viewed`, `demo_started`,
  `demo_submitted`, `contact_started`, `contact_submitted`,
  `waitlist_submitted`, `newsletter_subscribed`, `resource_downloaded`,
  `ai_opened`, `ai_question`, `ai_followup_clicked`.
- First-touch UTM is captured per session; DNT is honored as opt-out.
- `ConsentBanner` gates analytics/marketing/preferences (essential always
  on); choices persist in `localStorage`, reopenable from any footer via
  “Cookie preferences”. See `/legal/cookies`.

## Legal

Template Privacy, Terms, Acceptable Use, Cookies, and AI Terms ship at
`/legal/*`, aligned to actual processing (forms + first-party analytics)
with a DPDP Act 2023 notice. **Counsel review required** before treating
them as final (retention, subprocessors, DPA, grievance contact).

## What’s next (out of foundation scope)

- Visual/motion phase: hero intelligence field, motion language, WebGL.
- Backend phase: Supabase Auth admin, full CMS admin UI, email infra.
- AI Core phase: token limits, abuse detection, observability.

## Environment

Copy `.env-example` to `.env` for local development. Production needs at
minimum: `WORKFLO_ADMIN_TOKEN`, Resend (or `WORKFLO_EMAIL_MODE=mock`),
and — when provisioned — the Supabase pair.
