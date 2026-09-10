# Cortex-Site — Deployment Guide

> **Issue #9**: Render deployment contract / runbook / environment configuration
>
> This document is the single source of truth for deploying Cortex-Site to
> Render. It covers the build pipeline, environment contract, health checks,
> migration, and rollback procedures.

---

## 1. Prerequisites

| Requirement | Details |
|---|---|
| **Render account** | [render.com](https://render.com) — Free or Starter plan |
| **Supabase project** | [supabase.com](https://supabase.com) — for persistence & auth |
| **Resend account** | [resend.com](https://resend.com) — for email delivery |
| **Ollama endpoint** | Remote or local instance — for AI chat |
| **Node.js ≥ 20** | Required by Render's Node runtime |
| **pnpm** | Package manager (installed automatically by Render) |

---

## 2. Environment Variable Contract

All secrets are injected via the **Render dashboard** or `render secret set`.
Never commit secrets to Git. The `.env.example` file documents every variable.

### Required in production

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `WORKFLO_ADMIN_TOKEN` | Shared secret for admin dashboard login |

### Required for email delivery

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `WORKFLO_EMAIL_MODE` | Set to `resend` in production |
| `CORTEX_CONTACT_TO_EMAIL` | Recipient for contact form notifications |
| `CORTEX_CONTACT_EMAIL_FROM` | Verified sender address for contact emails |
| `WORKFLO_WAITLIST_TO_EMAIL` | Recipient for waitlist notifications |
| `WORKFLO_EMAIL_FROM` | Verified sender address for waitlist emails |

### Required for AI chat

| Variable | Purpose |
|---|---|
| `OLLAMA_BASE_URL` | Base URL of the Ollama instance |
| `OLLAMA_MODEL` | Model name (default: `llama3`) |

### Optional / defaults

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Server listen port (set automatically by Render) |
| `NODE_ENV` | `development` | Set to `production` by Render |
| `WORKFLO_WAITLIST_FILE` | `data/waitlist.json` | Dev-only local file |
| `CORTEX_CONTACT_FILE` | `data/contacts.json` | Dev-only local file |
| `CORTEX_DEMO_FILE` | `data/demos.json` | Dev-only local file |
| `CORTEX_NEWSLETTER_FILE` | `data/newsletter.json` | Dev-only local file |
| `CORTEX_ANALYTICS_FILE` | `data/analytics.json` | Dev-only local file |

---

## 3. Render Blueprint (`render.yaml`)

The repository includes a `render.yaml` blueprint at the root. To use it:

1. Go to **Render Dashboard → New → Blueprint**.
2. Select the `Kshitij-Tripathi87/Cortex-Site` repository.
3. Render will detect `render.yaml` and create the service automatically.
4. Set each secret in the Render dashboard under **Environment → Environment Variables**.

### Build & Start Commands

```bash
# Build (executed by Render)
pnpm install --frozen-lockfile && pnpm build

# Start (executed by Render)
node dist/index.js
```

### Health Check

Render polls `GET /api/health` every 30 seconds. The endpoint returns:

```json
{ "status": "ok", "timestamp": "<ISO 8601>" }
```

If the health check fails 3 consecutive times, Render restarts the service.

---

## 4. Startup Configuration Validation

The server validates its environment at startup via `server/config.ts`.

- **In production** (`NODE_ENV=production`): missing required variables cause
  an immediate process exit with a clear error message.
- **In development**: missing variables are logged as warnings and the server
  falls back to local JSON files / mock email.

This prevents silent misconfiguration — if Supabase or the admin token is
missing in production, the server refuses to start rather than running in a
broken state.

---

## 5. Database Migration Procedure

### Initial Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in the Supabase dashboard.
3. Run the migration file:

```bash
supabase/migrations/0001_marketing_core.sql
```

4. Verify tables were created:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

5. (Optional) Seed initial data:

```bash
supabase/seed.sql
```

### Subsequent Migrations

Future schema changes should be additive migration files under
`supabase/migrations/` with incrementing numeric prefixes.

---

## 6. First Deployment

1. **Connect repository** to Render via Blueprint.
2. **Set all secrets** in the Render dashboard (see Section 2).
3. **Trigger deploy** — Render will run `pnpm install && pnpm build`.
4. **Monitor build logs** for errors.
5. **Verify health check** — `GET https://<your-service>.onrender.com/api/health`.
6. **Test form submission** — submit the contact form and verify:
   - A row appears in Supabase `contact_requests` table.
   - An email is delivered to `CORTEX_CONTACT_TO_EMAIL`.
7. **Test admin login** — `POST /api/admin/login` with the admin token.
8. **Test AI chat** — `POST /api/ai/chat` and verify a response.

---

## 7. Rollback Procedure

### Automatic Rollback

Render keeps the last successful deploy. To rollback:

1. Go to **Render Dashboard → cortex-site → Deploys**.
2. Find the last successful deploy.
3. Click **Rollback to this deploy**.
4. Verify the health check passes.

### Manual Rollback via Git

```bash
# Find the last known-good commit
git log --oneline -10

# Create a rollback branch
git checkout -b rollback <good-commit-hash>

# Push and let Render auto-deploy
git push origin rollback
```

Then update the Render service to track the `rollback` branch temporarily.

---

## 8. Local Development

```bash
# Clone
git clone https://github.com/Kshitij-Tripathi87/Cortex-Site.git
cd Cortex-Site

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
# Edit .env with your local values

# Start dev server
pnpm dev
```

In development mode:
- Supabase is optional — the server uses local JSON files.
- Email is in mock mode — messages are logged to console.
- Ollama defaults to `http://localhost:11434`.

---

## 9. CI/CD Pipeline

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`
that runs on every push and pull request:

- `pnpm check` — type checking
- `pnpm test` — unit tests
- `pnpm test:e2e` — end-to-end tests (Playwright)

All checks must pass before a PR can be merged to `main`.

---

## 10. Security Checklist

- [ ] No secrets in Git (verified by `git log -p | grep -i key`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in Render environment
- [ ] `WORKFLO_ADMIN_TOKEN` is a strong random value (`openssl rand -hex 32`)
- [ ] `RESEND_API_KEY` is only in Render environment
- [ ] CORS is restricted to production domain in production
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active
- [ ] Health check endpoint is unauthenticated
