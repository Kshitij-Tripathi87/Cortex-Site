# design.md implementation record

This is an implementation record, not a replacement for `design.md` or a claim that every launch gate is closed.

## Implemented in this local revision

| Specification | Implementation |
| --- | --- |
| §§1–5, 24, 37–40: Cortex identity and editorial rhythm | Charcoal/silver/cobalt system; Space Grotesk / IBM Plex Sans / Mono; wide asymmetric compositions; existing Cortex-owned imagery; no TensorDyne assets or copy imported. |
| §§6, 29, 35: navigation | Shared restrained header/footer, Security link, product dropdown, full-screen mobile navigation. Mobile menu traps focus, supports Escape, restores focus, and makes the closed menu inert. Status links no longer assert operational health without a status response. |
| §§7–13, 41: signature opening | Three-line “Intelligence / for critical / systems.” hero; short supporting copy; Intelligence Field, native scroll cue; numbered premise. No live-product language on the field. |
| §§14–15, 31–32: progressive system story | Six-stage scroll-guided intelligence sequence and seven-stage operator walkthrough. Selecting a stage takes manual control; scroll guidance can be resumed. No timed content switching or scroll hijacking. Authorization and execution are separate. |
| §§16–19, 30: product family | Full-width visual chapters on Home and Products; distinct lazy WebGL studies for Workflo, Nexus, ASTRA; eight-section product briefs in the specified order. Workflo isolation/receipt chain, Nexus fan-in/fan-out World State graph, ASTRA branching design space. SVG diagrams include text descriptions and readable horizontal scrolling on narrow screens. |
| §§20–21: evidence | Reusable evidence register and datasheet benchmark component. No structural counts presented as performance results. CMS resources render only with publication date, product, value/unit, environment, measurement date, methodology, limitations, and HTTPS source. Bad/missing/offline content fails closed to an honest empty state. |
| §22: evolution | Only implemented public-website milestones are shown, explicitly not product-release claims. No speculative product dates. |
| §23: workloads | Six selectable applications with problem, role, product mapping, and architecture links. Clearly marked illustrative applications, not customer outcomes. |
| §§26–28: conversion, company, trust | Technical-requirement CTA, explicit briefing/contact destinations, engineering philosophy, trust boundary visualization, privacy/security/status links. |
| §§33–35: responsive, motion, accessibility | Desktop/tablet/mobile layouts; reduced motion disables WebGL and continuous effects; static posters remain. WebGL capability/data-saver/memory checks, error boundaries, DPR caps, offscreen/hidden-tab rendering controls. Mobile product studies use static artwork. Browser zoom allowed, visible focus, skip links, improved metadata contrast. |
| §§34, 36: loading and metadata | Secondary routes lazy-loaded; product scenes loaded near the viewport; semantic HTML is the story, not canvas. Product breadcrumbs and JSON-LD retained; unsupported free/preorder offer removed. |

## Content integrity

- Product architecture descriptions are conceptual marketing explanations, not verification of deployed software behavior.
- Existing example case-study pages now explicitly state that they are illustrative scenarios, not customer deployments, testimonials, or measured outcomes.
- Resource preview cards no longer attribute unpublished material to fabricated named employees.
- No benchmark data is seeded by this revision. Numeric evidence fixtures exist only in tests.
- CMS publication is an editorial assertion. Schema validation ensures provenance is present; it does **not** prove a measurement is true.

## CMS evidence contract

The frontend reads the existing `GET /api/content/resource` endpoint lazily. The server already limits Supabase results to `status = published`. A qualifying resource must conform to `shared/evidence.ts`:

- `type: resource`, nonempty `slug`, `title`, `body`, ISO `published_at`
- `metadata.kind: benchmark`
- `metadata.product: workflo | nexus | astra`
- `metadata.value`, `unit`, `environment`, `measuredAt` (YYYY-MM-DD), `methodology`, `limitations`, `sourceUrl` (HTTPS)

Only the `source: supabase` response can produce benchmark entries. Invalid rows are omitted individually. No Supabase configuration or public benchmark entries were created in this session.

## Validation performed

- `pnpm check`: passed.
- `pnpm test`: 19 unit tests passed, including publication-boundary tests.
- `pnpm build`: passed. Vite still reports a large **lazy** Three.js / React Three Fiber chunk; no claim of a completed Core Web Vitals audit.
- `pnpm test:e2e --workers=2`: 43 Chromium tests passed, including five automated WCAG A/AA scans on Home, Products, Workflo, Nexus, and ASTRA.
- Desktop (1440px) and mobile (390px) screenshots reviewed. Mobile overflow and reduced-motion checks cover Home and all three product briefs.
- WebGL hero and Workflo scene mounted in a real headless Chromium session without page runtime errors.
- No-WebGL, reduced-motion, menu focus trap/restore, direct architecture anchors, workload mapping, and mocked CMS provenance paths exercised.

The sandbox's Playwright CDN download was unavailable. Local browser tests used an independently installed headless Chromium 152 binary through `PLAYWRIGHT_CHROMIUM_EXECUTABLE`; this binary and its libraries are **not** repository dependencies. CI defaults to Playwright's own Chromium when the environment override is unset. CI was not run for this revision because the session is closed to remote GitHub operations.

## Intentionally not fabricated / remaining launch work

- **Optional cinematic film (§25):** not added without an approved film, poster, transcript, and captions. There is no nonfunctional Play button. Existing cinematic stills and WebGL studies provide the visual narrative.
- **Product evolution:** actual product-release milestones require documented sources; website milestones are not a substitute for them.
- **Evidence publication:** editorial owners must supply and verify real benchmarks, methodology artifacts, and customer permissions. The UI and CMS read path are ready; no verified outcomes are claimed.
- **Cross-browser / hardware review:** Safari/iOS, Firefox, low-end physical Android devices, screen-reader testing, and production Core Web Vitals remain launch checks. Automated accessibility scans are not a full accessibility certification.
- **Secondary pages:** Platform, Solutions, Company, Contact, Legal, and other existing routes retain the earlier shared dark frontend rather than receiving bespoke new chapter layouts in this revision. The new workload explorer lives on Home. A site-wide content/legal review remains necessary.
- **SEO delivery:** metadata is client-managed as in the existing application. No new SSR/prerender pipeline is claimed.
- **P2 (§42):** experimental transitions and detailed simulations intentionally deferred. A marketing website must not pretend to run production workloads.

## Publishing

Changes are local to `arena/01a08236-cortex-site`. The earlier PR was already merged, so this session cannot push or open another PR. Start a new coding session to publish this revision and run its CI before merging.
