-- Issue #20: make submission idempotency safe under concurrent requests.
-- The application still performs a fast duplicate check, but the database
-- constraint is the final authority and closes the check-then-insert race.

create unique index if not exists contact_messages_submission_hash_unique_idx
  on public.contact_messages (submission_hash)
  where submission_hash is not null;

create unique index if not exists demo_requests_submission_hash_unique_idx
  on public.demo_requests (submission_hash)
  where submission_hash is not null;

create unique index if not exists waitlist_entries_submission_hash_unique_idx
  on public.waitlist_entries (submission_hash)
  where submission_hash is not null;
