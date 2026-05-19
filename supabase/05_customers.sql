-- BareNest — customers table. Run AFTER 04_orders_address.sql.
-- Idempotent: safe to re-run.
--
-- One row per unique customer, keyed by normalized phone (Indian mobile).
-- Populated by the checkout server action via upsert on conflict (phone).
-- Aggregate stats (order count, lifetime value, last order) are derived
-- on read from public.orders — keeps the source of truth in one place.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text not null,
  email text,
  address text,
  city text,
  pincode text,
  user_id uuid references auth.users(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx
  on public.customers(user_id);
create index if not exists customers_last_seen_idx
  on public.customers(last_seen_at desc);

-- Touch updated_at on every update.
create or replace function public.touch_customers_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists customers_touch_updated_at on public.customers;
create trigger customers_touch_updated_at
  before update on public.customers
  for each row execute procedure public.touch_customers_updated_at();

alter table public.customers enable row level security;

-- Owners (staff) can read + manage. Anon users never touch this table —
-- the server action uses the service-role client, which bypasses RLS.
drop policy if exists "owner can read customers" on public.customers;
create policy "owner can read customers"
  on public.customers for select
  using (public.is_owner());

drop policy if exists "owner can manage customers" on public.customers;
create policy "owner can manage customers"
  on public.customers for all
  using (public.is_owner())
  with check (public.is_owner());
