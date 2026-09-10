-- Issue #4/#5: Submission idempotency and lifecycle tracking.
--
-- Adds a submission_hash column to intake tables so the server can detect
-- duplicate submissions within a time window and prevent redundant email
-- notifications. Also adds notification_status to track whether the email
-- was delivered after persistence succeeded.

-- contact_messages
alter table public.contact_messages
  add column if not exists submission_hash text,
  add column if not exists notification_status text
    not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed'));

create index if not exists contact_messages_hash_idx
  on public.contact_messages (submission_hash);
create index if not exists contact_messages_email_hash_idx
  on public.contact_messages (lower(email), submission_hash);

-- demo_requests
alter table public.demo_requests
  add column if not exists submission_hash text,
  add column if not exists notification_status text
    not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed'));

create index if not exists demo_requests_hash_idx
  on public.demo_requests (submission_hash);
create index if not exists demo_requests_email_hash_idx
  on public.demo_requests (lower(email), submission_hash);

-- waitlist_entries
alter table public.waitlist_entries
  add column if not exists submission_hash text,
  add column if not exists notification_status text
    not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed'));

create index if not exists waitlist_entries_hash_idx
  on public.waitlist_entries (submission_hash);
create index if not exists waitlist_entries_email_hash_idx
  on public.waitlist_entries (lower(email), submission_hash);
