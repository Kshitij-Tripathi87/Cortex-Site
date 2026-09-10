# Cortex Site — Production Deployment

This runbook is the operator contract for deploying the Cortex marketing site to Render with Supabase, Resend, and the remote Ollama-compatible AI endpoint.

## Architecture

```text
Render / Express
  ├── React/Vite static site
  ├── Supabase (authoritative persistence + Auth)
  ├── Resend (transactional notifications)
  └── Remote Ollama-compatible endpoint (optional runtime AI)
```

Production must not rely on the local JSON files or in-process security state. Those paths exist only for zero-config local development.

## Supabase setup

Apply these migrations in order:

```text
supabase/migrations/0001_marketing_core.sql
supabase/migrations/0002_submission_idempotency.sql
supabase/migrations/0003_admin_security_state.sql
supabase/migrations/0004_admin_auth.sql
supabase/migrations/0005_atomic_submission_idempotency.sql
```

The latest migration makes lead submission idempotency safe under concurrent requests. Do not skip migration ordering.

Create the private administrator in Supabase Auth, then set its UUID in `public.admin_users.auth_user_id` and keep `disabled=false`.

## Render environment contract

Set secrets only in Render's protected environment settings. Do not commit secrets, put them in `render.yaml`, expose them as `VITE_*`, or send them through chat.

Required production variables:

```text
NODE_ENV=production
SUPABASE_URL=<protected>
SUPABASE_SERVICE_ROLE_KEY=<protected>
RESEND_API_KEY=<protected>
CORTEX_EMAIL_MODE=resend
CORTEX_CONTACT_TO_EMAIL=<protected>
CORTEX_CONTACT_EMAIL_FROM=<protected>
CORTEX_WAITLIST_TO_EMAIL=<protected>
CORTEX_EMAIL_FROM=<protected>
OLLAMA_BASE_URL=<protected>
OLLAMA_MODEL=<model-name>
```

`render.yaml` contains the non-secret service definition and uses `sync: false` for secret values.

The obsolete `WORKFLO_ADMIN_TOKEN` must not be configured. Admin authentication now uses Supabase Auth plus the server-side session store.

## Render service

The Blueprint defines:

```text
Build:  pnpm install --frozen-lockfile && pnpm build
Start: node dist/index.js
Health: GET /api/health
```

The server validates its production environment before listening. An invalid/missing Supabase configuration fails startup instead of silently switching production to local storage or memory.

## Health checks

A healthy deployment returns HTTP 200 from `/api/health` and verifies both the application and Supabase dependency.

A dependency failure returns HTTP 503.

Use `/api/status` for the public operational snapshot, including real Ollama provider state after the AI-hardening release.

## Functional smoke test

After the first deploy verify:

```text
GET  /api/health
GET  /api/status
POST /api/contact
POST /api/demo
POST /api/waitlist
POST /api/newsletter
POST /api/ai/chat
GET  /admin/waitlist
```

For the forms, confirm records arrive in the corresponding Supabase tables (`contact_messages`, `demo_requests`, `waitlist_entries`, `newsletter_subscribers`). Confirm contact/demo/waitlist notifications arrive through Resend.

For resilience, verify that a notification failure leaves the persisted lead intact and returns `emailPending` rather than asking the visitor to resubmit. Identical concurrent submissions must not create duplicate records.

For admin, verify Supabase Auth login creates the opaque `cortex_admin_session` cookie and that protected routes return 401 without it.

For AI, verify the configured remote endpoint returns a model response and that the grounded fallback remains available during upstream timeout/error conditions.

## Deployment sequence

1. Apply the five Supabase migrations.
2. Create and link the admin Auth user.
3. Populate the protected Render environment variables.
4. Deploy the `main` branch through the Blueprint.
5. Wait for `/api/health` to pass.
6. Run the smoke test above.
7. Confirm the first form submissions in Supabase and Resend.

## Local development

```bash
pnpm install
cp .env-example .env
pnpm dev
```

Local development may run without Supabase and Resend. The store uses local JSON only when Supabase is not configured, and email may run in mock mode. Production does not use those fallbacks.

## CI gate

Every production release must come from a `main` commit with green GitHub Actions checks:

```text
pnpm check
pnpm test
pnpm build
pnpm test:e2e
```

Do not bypass a failing check for a production deploy.

## Rollback

Roll back the application to the last successful Render deploy. Database migrations are forward-only; do not remove production tables/columns as part of an application rollback.

After rollback, re-run `/api/health` and the functional smoke test before reopening traffic.
