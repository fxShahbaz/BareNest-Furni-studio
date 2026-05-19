-- BareNest profiles. Run AFTER 05_customers.sql.
-- Idempotent: safe to re-run.
--
-- One row per signed-in user. Holds the bits we mandate at sign-up that
-- Supabase auth doesn't store natively — phone number is the big one,
-- collected during email signup or via /onboarding after a Google
-- sign-in. The phone column bridges to public.customers (which is keyed
-- by phone) so a signed-in user's order history shows up on their
-- account page.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Phone is canonical (10-digit, prefix stripped) — must dedupe within
-- profiles since two different auth users shouldn't claim the same
-- mobile number. NB: existing customers table is also keyed on phone,
-- so the upsert path during signup keeps both tables consistent.
create unique index if not exists profiles_phone_unique
  on public.profiles(phone);

create index if not exists profiles_updated_at_idx
  on public.profiles(updated_at desc);

create or replace function public.touch_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_profiles_updated_at();

alter table public.profiles enable row level security;

-- Signed-in user reads + edits their own profile.
drop policy if exists "user reads own profile" on public.profiles;
create policy "user reads own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "user inserts own profile" on public.profiles;
create policy "user inserts own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "user updates own profile" on public.profiles;
create policy "user updates own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Studio staff can read all profiles (for /admin/customers cross-ref).
drop policy if exists "owner reads all profiles" on public.profiles;
create policy "owner reads all profiles"
  on public.profiles for select
  using (public.is_owner());
