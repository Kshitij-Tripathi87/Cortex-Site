-- Issue #7: Supabase Auth is the sole admin credential provider.

alter table public.admin_users add column if not exists auth_user_id uuid
  references auth.users(id) on delete cascade;

create unique index if not exists admin_users_auth_user_id_idx
  on public.admin_users (auth_user_id) where auth_user_id is not null;

drop policy if exists admin_users_service_read on public.admin_users;
create policy admin_users_service_read on public.admin_users
  for select to service_role using (true);

create or replace function public.is_admin(auth_uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.admin_users
    where auth_user_id = auth_uid
      and disabled = false
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to service_role;
