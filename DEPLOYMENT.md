# Deployment — Supabase + Cloudflare Workers

Production architecture:

```
Browser
   │
   ▼
Cloudflare Workers (cortex-site.*.workers.dev → custom domain before publish)
   ├── Static Assets (dist/public via the ASSETS binding)
   ├── API routes (contact / waitlist / ai-chat — Express contract mirrored)
   ├── Security headers + rate limiting
   ├── Edge SEO (robots.txt, sitemap.xml)
          │
          ├──▶ Supabase (PostgreSQL — authoritative persistence)
          └──▶ Resend (email delivery)
```

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   It creates `contact_requests` and `waitlist_signups` with RLS enabled and
   zero public policies — only the service role (Worker) can write.
3. Copy from **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secret — never expose client-side)

## 2. Resend setup

1. Create an account at [resend.com](https://resend.com) and verify a sending domain.
2. Create an API key → `RESEND_API_KEY` (secret).
3. Note the sender identity (e.g. `Cortex <contact@yourdomain.com>`) → `CORTEX_CONTACT_EMAIL_FROM`.
4. Note the notification inbox → `CORTEX_CONTACT_TO_EMAIL`.

For local testing without credentials, set `WORKFLO_EMAIL_MODE=mock` — the
Express server logs notifications instead of sending.

## 3. Cloudflare Workers setup

1. Log in: `npx wrangler login`
2. Set secrets:
   ```
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put CORTEX_CONTACT_EMAIL_FROM
   npx wrangler secret put CORTEX_CONTACT_TO_EMAIL
   npx wrangler secret put WORKFLO_ADMIN_TOKEN
   ```
3. Build and deploy:
   ```
   pnpm build
   pnpm worker:deploy
   ```
   Development preview: `pnpm worker:dev` (serves on a `*.workers.dev` URL).

## 4. Custom domain (before publish)

Once a domain is purchased/registered:

1. Add the zone to Cloudflare (**Add site** → follow DNS instructions).
2. In the Worker: **Settings → Domains & Routes → Add → Custom domain**
   (e.g. `cortexos.systems`).
3. Update `CORTEX_SITE_URL` / canonical references to the final domain.

## 5. Verification checklist

- `curl -X POST /api/contact` with valid JSON → 200; row appears in Supabase
- Missing Resend config → 503 with friendly message (fail-safe, not silent)
- Missing Supabase config → Worker skips persistence, still responds
- `/robots.txt` and `/sitemap.xml` → 200 from the edge
- Unknown routes → SPA shell; unknown API → 404 JSON
- Security headers present on every response
