-- Cortex Marketing Platform v1 — core backend schema.
--
-- Scope: marketing acquisition + content only. No payments, workspaces, agent
-- execution, or operational APIs. Those belong to app.cortex.com.
--
-- Security model:
--   * RLS enabled on every table.
--   * The browser (anon/publishable key) may only INSERT into intake tables
--     (leads, demo_requests, contact_messages, waitlist_entries,
--     newsletter_subscribers, analytics_events) and SELECT published content.
--   * All reads of PII and all writes to content/settings require the
--     server-side service-role key (Express), which bypasses RLS and must
--     never be exposed to the browser.
--   * Admin identity migrates to Supabase Auth in a later phase; until then
--     the Express session gate remains the authorization boundary.

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Intake: leads (unified funnel record)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  name text not null default '',
  company text not null default '',
  role text not null default '',
  source text not null default 'website',
  campaign text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_term text not null default '',
  utm_content text not null default '',
  status text not null default 'new'
    check (status in ('new', 'qualified', 'contacted', 'converted', 'archived')),
  notes text not null default ''
);

create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_status_created_idx on public.leads (status, created_at desc);

drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

alter table public.leads enable row level security;

-- Browser may create leads; only the server may read or mutate them.
drop policy if exists "anon_insert_leads" on public.leads;
create policy "anon_insert_leads" on public.leads
  for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- Intake: demo_requests
-- ---------------------------------------------------------------------------
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references public.leads (id) on delete set null,
  name text not null default '',
  email text not null,
  company text not null default '',
  role text not null default '',
  company_size text not null default '',
  product text not null default '',
  message text not null default '',
  preferred_date text not null default '',
  status text not null default 'new'
    check (status in ('new', 'scheduled', 'completed', 'cancelled', 'archived'))
);

create index if not exists demo_requests_email_idx on public.demo_requests (lower(email));
create index if not exists demo_requests_status_created_idx on public.demo_requests (status, created_at desc);

drop trigger if exists demo_requests_touch on public.demo_requests;
create trigger demo_requests_touch before update on public.demo_requests
  for each row execute function public.touch_updated_at();

alter table public.demo_requests enable row level security;

drop policy if exists "anon_insert_demo_requests" on public.demo_requests;
create policy "anon_insert_demo_requests" on public.demo_requests
  for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- Intake: contact_messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null default '',
  email text not null,
  company text not null default '',
  product text not null default '',
  message text not null default '',
  status text not null default 'new'
    check (status in ('new', 'replied', 'archived'))
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "anon_insert_contact_messages" on public.contact_messages;
create policy "anon_insert_contact_messages" on public.contact_messages
  for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- Intake: waitlist_entries (Workflo early access)
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null default '',
  email text not null,
  company text not null default '',
  source text not null default 'website',
  status text not null default 'pending'
    check (status in ('pending', 'invited', 'converted', 'archived'))
);

create index if not exists waitlist_entries_email_idx on public.waitlist_entries (lower(email));

alter table public.waitlist_entries enable row level security;

drop policy if exists "anon_insert_waitlist_entries" on public.waitlist_entries;
create policy "anon_insert_waitlist_entries" on public.waitlist_entries
  for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- Intake: newsletter_subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text not null default 'website',
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "anon_insert_newsletter" on public.newsletter_subscribers;
create policy "anon_insert_newsletter" on public.newsletter_subscribers
  for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- Analytics: first-party, privacy-conscious events
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id bigint primary key generated always as identity,
  created_at timestamptz not null default now(),
  event text not null,
  page text not null default '',
  referrer text not null default '',
  session_id text not null default '',
  properties jsonb not null default '{}'::jsonb,
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default ''
);

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at desc);
create index if not exists analytics_events_page_created_idx
  on public.analytics_events (page, created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "anon_insert_analytics_events" on public.analytics_events;
create policy "anon_insert_analytics_events" on public.analytics_events
  for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- CMS: content (products, case studies, insights, resources, FAQs, pages)
-- ---------------------------------------------------------------------------
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null,
  type text not null
    check (type in ('product', 'case-study', 'insight', 'resource', 'faq', 'page', 'announcement')),
  title text not null default '',
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  unique (type, slug)
);

create index if not exists content_type_status_idx on public.content (type, status);

drop trigger if exists content_touch on public.content;
create trigger content_touch before update on public.content
  for each row execute function public.touch_updated_at();

alter table public.content enable row level security;

-- Published content is world-readable; everything else is server-only.
drop policy if exists "anon_read_published_content" on public.content;
create policy "anon_read_published_content" on public.content
  for select to anon using (status = 'published');

-- ---------------------------------------------------------------------------
-- Site configuration: settings, flags, redirects, SEO
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
-- No anon policies: server reads settings with the service-role key and
-- exposes only the public-safe subset via /api/content.

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

create table if not exists public.redirects (
  source text primary key,
  destination text not null,
  permanent boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.redirects enable row level security;

drop policy if exists "anon_read_redirects" on public.redirects;
create policy "anon_read_redirects" on public.redirects
  for select to anon using (true);

create table if not exists public.seo_metadata (
  path text primary key,
  title text not null default '',
  description text not null default '',
  image text not null default '',
  no_index boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.seo_metadata enable row level security;

drop policy if exists "anon_read_seo" on public.seo_metadata;
create policy "anon_read_seo" on public.seo_metadata
  for select to anon using (true);

-- ---------------------------------------------------------------------------
-- Admin + audit (server-side only; no anon policies by design)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Supabase Auth user id, once admin identity migrates to Supabase Auth.
  auth_user_id uuid unique,
  email text not null unique,
  role text not null default 'analyst'
    check (role in ('admin', 'editor', 'analyst')),
  disabled boolean not null default false
);

alter table public.admin_users enable row level security;

create table if not exists public.audit_logs (
  id bigint primary key generated always as identity,
  created_at timestamptz not null default now(),
  actor text not null default '',
  action text not null default '',
  resource text not null default '',
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;
