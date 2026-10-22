-- QR-ATT Admin feature migration
-- Run once in Supabase Dashboard -> SQL Editor.
-- This migration does not create accounts or expose a service-role key.

begin;

-- 1) Permit the trusted admin role in profiles.role.
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
      and pg_get_constraintdef(oid) ilike '%student%'
      and pg_get_constraintdef(oid) ilike '%teacher%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'teacher', 'admin'));

-- 2) Security-definer helper avoids recursive RLS queries on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3) Admins can read all profiles, attendance, and events.
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can view all attendance" on public.attendance;
create policy "Admins can view all attendance"
  on public.attendance
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can view all events" on public.events;
create policy "Admins can view all events"
  on public.events
  for select
  to authenticated
  using (public.is_admin());

-- 4) Prevent a signed-in user from promoting their own profile.
-- A trusted SQL Editor update (where auth.uid() is NULL) is allowed.
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and auth.uid() = old.id then
    raise exception 'You cannot change your own role.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_self_role_change on public.profiles;
create trigger prevent_self_role_change
  before update of role on public.profiles
  for each row
  execute function public.prevent_self_role_change();

commit;

-- 5) After running this migration, create/promote the first admin manually:
-- Replace the email below with the exact email of an account you already registered.
-- Run this UPDATE as a separate query in SQL Editor.
--
-- update public.profiles
-- set role = 'admin', updated_at = now()
-- where lower(email) = lower('your-admin-email@example.com');
--
-- Verify it updated exactly one row:
-- select id, email, full_name, role
-- from public.profiles
-- where lower(email) = lower('your-admin-email@example.com');
