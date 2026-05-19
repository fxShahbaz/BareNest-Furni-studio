-- BareNest schema. Run in Supabase SQL editor.

-- products (optional mirror of /src/lib/products.ts; useful once owner manages catalogue from the dashboard)
create table if not exists public.products (
  slug text primary key,
  name text not null,
  tagline text,
  description text,
  category text not null,
  material text not null check (material in ('Solid Wood', 'MDF')),
  price integer not null,
  dimensions text,
  features text[] default '{}',
  images text[] default '{}',
  created_at timestamptz default now()
);

alter table public.products enable row level security;

-- read-public, write-only for service role
drop policy if exists "products are public" on public.products;
create policy "products are public"
  on public.products for select
  using (true);

-- orders captured at checkout (guest checkout supported)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  notes text,
  items jsonb not null,
  total integer not null,
  status text not null default 'new' check (status in ('new', 'confirmed', 'fulfilled', 'cancelled')),
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

-- anyone (anon) can insert their own order; only signed-in user can read their own
drop policy if exists "anyone can place order" on public.orders;
create policy "anyone can place order"
  on public.orders for insert
  with check (true);

drop policy if exists "owner can read own order" on public.orders;
create policy "owner can read own order"
  on public.orders for select
  using (auth.uid() = user_id);

-- mailing list signups
create table if not exists public.subscribers (
  email text primary key,
  created_at timestamptz default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "anyone can subscribe" on public.subscribers;
create policy "anyone can subscribe"
  on public.subscribers for insert
  with check (true);
