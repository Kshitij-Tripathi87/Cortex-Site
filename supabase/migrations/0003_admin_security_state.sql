-- Issue #6: Distributed security state.
--
-- Moves admin sessions and login attempt tracking from process memory
-- to Supabase so they survive Render restarts and are visible across
-- instances. Rate limiting remains pluggable (in-memory for dev,
-- Supabase-backed for production).

-- Admin sessions: durable, revocable
create table if not exists public.admin_sessions (
  session_id text primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ip text not null default '',
  user_agent text not null default ''
);

create index if not exists admin_sessions_expires_idx
  on public.admin_sessions (expires_at);

alter table public.admin_sessions enable row level security;
-- No anon policies: server manages sessions with the service-role key.

-- Login attempt tracking: distributed brute-force protection
create table if not exists public.admin_login_attempts (
  ip text primary key,
  count integer not null default 0,
  first_attempt_at timestamptz not null default now(),
  locked_until timestamptz not null default now()
);

alter table public.admin_login_attempts enable row level security;
-- No anon policies: server manages login attempts with the service-role key.

-- Rate limit buckets: distributed rate limiting
create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists rate_limit_buckets_reset_idx
  on public.rate_limit_buckets (reset_at);

alter table public.rate_limit_buckets enable row level security;
-- No anon policies: server manages rate limits with the service-role key.
