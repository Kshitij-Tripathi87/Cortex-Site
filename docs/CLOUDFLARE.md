# Cortex Site — Cloudflare Workers Deployment

This runbook covers deploying the site to **Cloudflare Workers**. `docs/DEPLOYMENT.md`
covers the Render/Node path; both run the same Express application.

## Why this file exists

`wrangler deploy` used to fail with:

```text
🛠️  Configuring project for Vite
✘ [ERROR] Cannot modify Vite config: could not find a valid plugins array.
```

Wrangler auto-configures Vite projects when it finds **no** Wrangler config file.
It rewrites `vite.config.ts` to add `@cloudflare/vite-plugin`, and it looks for a
literal `plugins: [...]` array. This project declared its plugins as a variable
and passed them as `plugins,`, which the codemod cannot follow — so the deploy
died after `pnpm run build` had already succeeded.

Committing `wrangler.jsonc` is the fix: any Wrangler config file disables that
auto-setup, so the deploy now goes straight to bundling and uploading.

## Architecture

```text
Cloudflare Workers
  ├── Static assets (dist/public)  — served by the platform, Worker not invoked
  └── Worker (worker/index.ts)     — everything else: page routes + /api/*
        └── Express app (server/app.ts) via node:http
              ├── Supabase (authoritative persistence + Auth)
              ├── Resend (transactional notifications)
              └── Ollama-compatible endpoint (optional runtime AI)
```

- **Static assets**: `assets.directory = "dist/public"`. Real files are served
  before the Worker runs.
- **`html_handling: "none"`**: without it, `/` would be answered with the raw
  `index.html` and skip server rendering, losing every route's `<title>`,
  description and canonical URL.
- **No `not_found_handling`**: requests that match no asset fall through to the
  Worker, which server-renders known routes and returns the branded 404 page
  for everything else.
- **Express on Workers**: the `2026-09-15` compatibility date enables
  `nodejs_compat` by default, which provides `node:http`. `worker/index.ts`
  boots the app on an in-isolate port and routes requests through
  `handleAsNodeRequest` from `cloudflare:node`.

## Required settings

`NODE_ENV=production` is already set in `wrangler.jsonc` `vars`. Set everything
else as **encrypted secrets** (dashboard → Workers & Pages → cortex-site →
Settings → Variables, or `wrangler secret put <NAME>`):

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
CORTEX_EMAIL_MODE=resend
CORTEX_CONTACT_TO_EMAIL
CORTEX_CONTACT_EMAIL_FROM
CORTEX_WAITLIST_TO_EMAIL
CORTEX_EMAIL_FROM
```

Optional, non-secret (`vars`):

```text
SITE_URL=https://your-domain.com    # canonical/OG URLs; defaults to https://cortex.systems
OLLAMA_BASE_URL
OLLAMA_MODEL
```

`server/config.ts` validates these at first request. If any are missing the
Worker returns `503 Service temporarily unavailable.` and logs the missing keys
rather than crashing the isolate — static assets keep serving throughout.

## Deploying

Workers Builds (dashboard), already configured:

```text
Framework preset:  Vite
Build command:     pnpm run build
Deploy command:    npx wrangler deploy
Output directory:  dist
```

From a terminal:

```bash
pnpm run deploy          # build + wrangler deploy
pnpm run deploy:dry-run  # bundle and size check, no upload
```

`pnpm run deploy:dry-run` needs no Cloudflare credentials and is the quickest
way to confirm the Worker still bundles after dependency changes.

## Local check

```bash
cp .env.example .dev.vars   # or write the vars above into .dev.vars
pnpm run worker:dev         # builds, then wrangler dev
```

`.dev.vars` is git-ignored. `wrangler dev` runs the real Workers runtime
(workerd), so it catches things a `vite build` cannot — for example code that
uses `node:fs` or creates timers at module scope.

## Runtime differences from Render

| Behaviour | Render (Node) | Cloudflare Workers |
| --- | --- | --- |
| Static files | `express.static` from disk | platform asset layer, before the Worker |
| Page rendering | server-rendered | server-rendered (template read via the `ASSETS` binding) |
| In-memory rate limits | shared across the process | per isolate — Supabase-backed limiting is still global |
| Local JSON fallback | development only | unavailable (no filesystem); production is Supabase-only |
| Background sweeps | timers at startup | timers start on first request (Workers forbids global-scope timers) |
