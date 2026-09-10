-- Issue #6: distributed security state for Render.

create table if not exists public.admin_sessions (
  session_id text primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ip text not null default '',
  user_agent text not null default ''
);
create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at);
alter table public.admin_sessions enable row level security;

create table if not exists public.admin_login_attempts (
  ip text primary key,
  count integer not null default 0,
  first_attempt_at timestamptz not null default now(),
  locked_until timestamptz not null default now()
);
alter table public.admin_login_attempts enable row level security;

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);
create index if not exists rate_limit_buckets_reset_idx on public.rate_limit_buckets (reset_at);
alter table public.rate_limit_buckets enable row level security;

-- Atomic failed-login counter. The row lock prevents concurrent requests from
-- overwriting each other's counters. Only service-role callers can reach it.
create or replace function public.record_failed_login(
  p_ip text,
  p_max_attempts integer,
  p_window_ms bigint,
  p_lockout_ms bigint
)
returns table(count integer, first_attempt_at timestamptz, locked_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.admin_login_attempts%rowtype;
  now_ts timestamptz := now();
begin
  select * into current_row
  from public.admin_login_attempts
  where ip = p_ip
  for update;

  if not found or extract(epoch from (now_ts - current_row.first_attempt_at)) * 1000 > p_window_ms then
    insert into public.admin_login_attempts(ip, count, first_attempt_at, locked_until)
    values (p_ip, 1, now_ts, now_ts);
  elsif current_row.count < p_max_attempts then
    update public.admin_login_attempts
      set count = current_row.count + 1,
          locked_until = case
            when current_row.count + 1 >= p_max_attempts
              then now_ts + make_interval(secs => p_lockout_ms / 1000.0)
            else current_row.locked_until
          end
      where ip = p_ip;
  end if;

  return query
    select a.count, a.first_attempt_at, a.locked_until
    from public.admin_login_attempts a
    where a.ip = p_ip;
end;
$$;

-- Atomic fixed-window rate-limit consumption. When the window is active and
-- the bucket is already exhausted, the counter is not incremented further.
create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_max_requests integer,
  p_window_ms bigint
)
returns table(count integer, reset_at timestamptz, allowed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.rate_limit_buckets%rowtype;
  now_ts timestamptz := now();
  next_reset timestamptz;
begin
  select * into current_row
  from public.rate_limit_buckets
  where bucket_key = p_bucket_key
  for update;

  if not found or current_row.reset_at <= now_ts then
    next_reset := now_ts + make_interval(secs => p_window_ms / 1000.0);
    insert into public.rate_limit_buckets(bucket_key, count, reset_at, updated_at)
    values (p_bucket_key, 1, next_reset, now_ts)
    on conflict (bucket_key) do update
      set count = 1, reset_at = excluded.reset_at, updated_at = excluded.updated_at;
  elsif current_row.count < p_max_requests then
    update public.rate_limit_buckets
      set count = current_row.count + 1, updated_at = now_ts
      where bucket_key = p_bucket_key;
  end if;

  return query
    select b.count, b.reset_at, (b.count <= p_max_requests)
    from public.rate_limit_buckets b
    where b.bucket_key = p_bucket_key;
end;
$$;

revoke all on function public.record_failed_login(text, integer, bigint, bigint) from public;
revoke all on function public.consume_rate_limit(text, integer, bigint) from public;
grant execute on function public.record_failed_login(text, integer, bigint, bigint) to service_role;
grant execute on function public.consume_rate_limit(text, integer, bigint) to service_role;
