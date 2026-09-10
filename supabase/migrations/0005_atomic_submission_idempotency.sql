-- Issue #20: database-enforced idempotency for concurrent intake requests.
-- The application performs a fast duplicate check, while these constraints
-- are the final authority for concurrent identical submissions.

do $$
begin
  delete from public.contact_messages a using public.contact_messages b
    where a.submission_hash is not null
      and a.submission_hash = b.submission_hash
      and lower(a.email) = lower(b.email)
      and a.id > b.id;
  delete from public.demo_requests a using public.demo_requests b
    where a.submission_hash is not null
      and a.submission_hash = b.submission_hash
      and lower(a.email) = lower(b.email)
      and a.id > b.id;
  delete from public.waitlist_entries a using public.waitlist_entries b
    where a.submission_hash is not null
      and a.submission_hash = b.submission_hash
      and lower(a.email) = lower(b.email)
      and a.id > b.id;
end $$;

create unique index if not exists contact_messages_submission_identity_unique_idx
  on public.contact_messages (lower(email), submission_hash)
  where submission_hash is not null;

create unique index if not exists demo_requests_submission_identity_unique_idx
  on public.demo_requests (lower(email), submission_hash)
  where submission_hash is not null;

create unique index if not exists waitlist_entries_submission_identity_unique_idx
  on public.waitlist_entries (lower(email), submission_hash)
  where submission_hash is not null;
