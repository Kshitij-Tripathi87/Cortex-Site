-- Issue #7: Migrate admin auth to Supabase Auth.
--
-- Sets up per-user authenticated identity for admin access instead of a
-- shared admin token. The admin_users table (from 0001) is used to
-- determine who has admin privileges.

-- Ensure admin_users table has an email column matching auth.users
alter table public.admin_users add column if not exists auth_user_id uuid
  references auth.users(id) on delete cascade;

create unique index if not exists admin_users_auth_user_id_idx
  on public.admin_users (auth_user_id) where auth_user_id is not null;

-- Policy: service role can read admin_users (for server-side auth checks)
-- This is already handled by RLS being enabled with no anon policies,
-- but we add an explicit policy for clarity.
drop policy if exists admin_users_service_read on public.admin_users;
create policy admin_users_service_read on public.admin_users
  for select to service_role using (true);

-- Helper function: check if a given auth user ID is an admin
create or replace function public.is_admin(auth_uid uuid)
returns boolean
language sql
security definer
as $$
  select exists(
    select 1 from public.admin_users
    where auth_user_id = auth_uid
  );
$$;
