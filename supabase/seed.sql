-- Cortex Marketing Platform v1 — seed data.
-- Run after 0001_marketing_core.sql. Safe to re-run (upserts only).

-- ---------------------------------------------------------------------------
-- Site settings (public-safe subset is exposed via /api/content)
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('brand', '{"name": "Cortex", "tagline": "Clarity for critical systems.", "signalColor": "#2457E6"}'::jsonb),
  ('contact', '{"email": "hello@cortex.systems", "demoCta": "/demo", "contactCta": "/contact"}'::jsonb),
  ('announcement', '{"enabled": false, "message": ""}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ---------------------------------------------------------------------------
-- Feature flags
-- ---------------------------------------------------------------------------
insert into public.feature_flags (key, enabled, description) values
  ('ai_core', true, 'AI Core grounded assistant'),
  ('newsletter', true, 'Newsletter signup forms'),
  ('waitlist', true, 'Workflo early-access waitlist'),
  ('analytics', true, 'First-party analytics collection')
on conflict (key) do update set enabled = excluded.enabled, description = excluded.description, updated_at = now();

-- ---------------------------------------------------------------------------
-- Redirects (mirror of shared/site.ts REDIRECTS)
-- ---------------------------------------------------------------------------
insert into public.redirects (source, destination, permanent) values
  ('/product', '/products', true),
  ('/product/workflo', '/products/workflo', true),
  ('/product/nexus', '/products/nexus', true),
  ('/product/astra', '/products/astra', true),
  ('/product/sense', '/products/workflo', true),
  ('/product/decide', '/products/nexus', true),
  ('/product/scale', '/products/astra', true),
  ('/products/sense', '/products/workflo', true),
  ('/products/decide', '/products/nexus', true),
  ('/products/scale', '/products/astra', true),
  ('/resources/case-studies/northstar-health', '/case-study/northstar-health', true),
  ('/resources/case-studies/vela-financial', '/case-study/vela-financial', true),
  ('/resources/case-studies/aster-works', '/case-study/aster-works', true)
on conflict (source) do update set destination = excluded.destination, permanent = excluded.permanent, updated_at = now();

-- ---------------------------------------------------------------------------
-- SEO metadata (mirror of shared/site.ts SITE_ROUTES core entries)
-- ---------------------------------------------------------------------------
insert into public.seo_metadata (path, title, description) values
  ('/', 'Cortex — Clarity for critical systems', 'Cortex is the intelligence layer for teams building critical systems — turn complex signals into confident decisions.'),
  ('/products', 'Products — Cortex', 'Workflo, Nexus, and ASTRA. Three products, one intelligence layer for critical systems.'),
  ('/platform', 'Platform — The intelligence layer beneath the work | Cortex', 'Connect the systems you already trust. Give every team the context to move.'),
  ('/solutions', 'Solutions — Cortex', 'Operating patterns for teams running complex, consequential systems.'),
  ('/security', 'Security & Trust — Cortex', 'Security, permissions, and an auditable operating model, enterprise-grade by design.'),
  ('/pricing', 'Pricing — Cortex', 'Pilot, Platform, and Enterprise paths. Start with a working session.'),
  ('/contact', 'Contact — Talk to Cortex', 'Bring us the hard question. We’ll make the first conversation useful.'),
  ('/demo', 'Book a Demo — Cortex', 'Walk through one decision your team needs to make better.')
on conflict (path) do update set title = excluded.title, description = excluded.description, updated_at = now();

-- ---------------------------------------------------------------------------
-- CMS content: products + case studies (published)
-- ---------------------------------------------------------------------------
insert into public.content (slug, type, title, body, metadata, status, published_at) values
  ('workflo', 'product', 'See the system, not just the signal.',
   'Workflo gives teams a continuously legible view of the conditions shaping the business.',
   '{"name": "Workflo", "status": "Early access", "capabilities": ["Signal unification", "Root-cause exploration", "Shared operating picture", "Live and historical context"]}'::jsonb,
   'published', now()),
  ('nexus', 'product', 'Move from insight to action with context.',
   'Nexus turns a complex question into an explicit, evidence-backed decision path.',
   '{"name": "Nexus", "status": "Coming soon", "capabilities": ["Plain-language questions", "Evidence trails", "Decision paths", "Owner routing"]}'::jsonb,
   'published', now()),
  ('astra', 'product', 'Make the better way repeatable.',
   'ASTRA codifies what your best teams know into workflows that travel across functions and regions.',
   '{"name": "ASTRA", "status": "Coming soon", "capabilities": ["Workflow templates", "Governed operating patterns", "Local flexibility", "Performance feedback"]}'::jsonb,
   'published', now()),
  ('northstar-health', 'case-study', 'A shared language for complexity.',
   'Northstar Health operates across a dense network of clinical, operational, and payer relationships.',
   '{"company": "Northstar Health", "sector": "Healthcare operations"}'::jsonb,
   'published', now()),
  ('vela-financial', 'case-study', 'From weekly reconciliation to a living risk picture.',
   'Vela Financial needed to reduce the distance between risk review and product action without weakening controls.',
   '{"company": "Vela Financial", "sector": "Risk & compliance"}'::jsonb,
   'published', now()),
  ('aster-works', 'case-study', 'Confidence while the window is still open.',
   'Aster Works runs a network of industrial sites where a small delay in interpreting a signal can create a large operational cost.',
   '{"company": "Aster Works", "sector": "Industrial systems"}'::jsonb,
   'published', now())
on conflict (type, slug) do update
  set title = excluded.title, body = excluded.body, metadata = excluded.metadata,
      status = excluded.status, updated_at = now();
