-- Issue #20: database-enforced idempotency for concurrent intake requests.
-- Clean up any pre-existing duplicate hashes before creating unique indexes.

do $$
begin
  delete from public.contact_messages a using public.contact_messages b
    where a.submission_hash is not null
      and a.submission_hash = b.submission_hash
      and a.id > b.id;
  delete from public.demo_requests a using public.demo_requests b
    where a.submission_hash is not null
      and a.submission_hash = b.submission_hash
      and a.id > b.id;
  delete from public.waitlist_entries a using public.waitlist_entries b
    where a.submission_hash is not null
      and a.submission_hash = b.submission_hash
      and a.id > b.id;
exception when undefined_column then
  null;
end $$;

create unique index if not exists contact_messages_submission_hash_unique_idx
  on public.contact_messages (submission_hash)
  where submission_hash is not null;
create unique index if not exists demo_requests_submission_hash_unique_idx
  on public.demo_requests (submission_hash)
  where submission_hash is not null;
create unique index if not exists waitlist_entries_submission_hash_unique_idx
  on public.waitlist_entries (submission_hash)
  where submission_hash is not null;
