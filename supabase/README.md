# Cortex Supabase backend (marketing layer)

Marketing acquisition + content only. No payments, workspaces, agent
execution, or operational APIs — those belong to `app.cortex.com`.

## Layout

```text
supabase/
  migrations/
    0001_marketing_core.sql   intake, analytics, CMS, settings, admin, audit
  seed.sql                    brand settings, flags, redirects, SEO, content
```

## Setup

1. Create a Supabase project (production + a separate preview project).
2. Run `migrations/0001_marketing_core.sql`, then `seed.sql`
   (SQL editor, or `supabase db push` if you adopt the Supabase CLI).
3. Configure the Express server (see root `.env-example`):

```text
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret — server only, never VITE_ prefixed>
```

4. Until those variables are set, the server automatically falls back to
   local JSON storage under `data/` — no code changes needed either way.

## Security rules (non-negotiable)

- RLS is enabled on every table; the migration is the source of truth.
- The browser uses the publishable key only, and may only:
  - `INSERT` into intake tables (`leads`, `demo_requests`,
    `contact_messages`, `waitlist_entries`, `newsletter_subscribers`,
    `analytics_events`);
  - `SELECT` published `content`, `redirects`, and `seo_metadata`.
- The service-role key bypasses RLS and stays server-side (Express).
- There is intentionally no `VITE_SUPABASE_*` secret in this repo.
- PII reads (leads, demos, contacts, waitlist) are server-side only.
