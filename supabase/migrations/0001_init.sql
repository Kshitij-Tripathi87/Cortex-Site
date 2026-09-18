-- Cortex Site — Supabase schema (authoritative persistence)
-- Run in the Supabase SQL editor (or via `supabase db push`).
--
-- The Cloudflare Worker inserts rows using the service-role key, which
-- bypasses RLS. RLS is enabled with no public policies so anonymous visitors
-- can never read or write submissions directly.

-- ---------------------------------------------------------------------------
-- Contact / demo requests
-- ---------------------------------------------------------------------------
create table if not exists public.contact_requests (
  id            text primary key,
  name          text not null,
  email         text not null,
  company       text not null,
  role          text not null default '',
  company_size  text not null default '',
  product       text not null default '',
  message       text not null,
  timing        text not null default '',
  submitted_at  timestamptz not null default now()
);

create index if not exists contact_requests_submitted_at_idx
  on public.contact_requests (submitted_at desc);

-- ---------------------------------------------------------------------------
-- Workflo waitlist signups
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist_signups (
  id            text primary key,
  name          text not null,
  email         text not null,
  company       text not null default '',
  submitted_at  timestamptz not null default now()
);

create index if not exists waitlist_signups_submitted_at_idx
  on public.waitlist_signups (submitted_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: deny-all for anon/authenticated; only the service role
-- (used by the Worker) bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.contact_requests enable row level security;
alter table public.waitlist_signups enable row level security;

-- No policies are created: with RLS enabled and zero policies, anon and
-- authenticated clients get zero rows. Service-role connections ignore RLS.
