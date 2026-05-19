-- BareNest admin + storage. Run AFTER schema.sql, in the Supabase SQL editor.
-- Idempotent: safe to re-run.

-- ============================================================
-- Owners: anyone in this table can read all orders + edit catalogue
-- Bootstrap: after first sign-up, insert your auth.users.id row here.
--   insert into public.owners(user_id)
--     values ((select id from auth.users where email = 'you@example.com'));
-- ============================================================
create table if not exists public.owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz default now()
);

alter table public.owners enable row level security;

-- is_owner() — reused in every owner-gated policy. SECURITY DEFINER so the
-- check works even when called from contexts where the caller can't SELECT
-- from public.owners directly.
create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.owners where user_id = auth.uid());
$$;

drop policy if exists "owners read owners" on public.owners;
create policy "owners read owners"
  on public.owners for select
  using (public.is_owner());

drop policy if exists "owners manage owners" on public.owners;
create policy "owners manage owners"
  on public.owners for all
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- Products: owners can write
-- ============================================================
drop policy if exists "owner can insert product" on public.products;
create policy "owner can insert product"
  on public.products for insert
  with check (public.is_owner());

drop policy if exists "owner can update product" on public.products;
create policy "owner can update product"
  on public.products for update
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "owner can delete product" on public.products;
create policy "owner can delete product"
  on public.products for delete
  using (public.is_owner());

-- ============================================================
-- Orders: add attachments + customer_email; owners see + update all
-- ============================================================
alter table public.orders add column if not exists attachments text[] default '{}';
alter table public.orders add column if not exists customer_email text;

drop policy if exists "owner can read all orders" on public.orders;
create policy "owner can read all orders"
  on public.orders for select
  using (public.is_owner());

drop policy if exists "owner can update orders" on public.orders;
create policy "owner can update orders"
  on public.orders for update
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- Subscribers: owners can read the list
-- ============================================================
drop policy if exists "owner can read subscribers" on public.subscribers;
create policy "owner can read subscribers"
  on public.subscribers for select
  using (public.is_owner());

-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('order-attachments', 'order-attachments', false)
on conflict (id) do nothing;

-- product-images: public read, owner write
drop policy if exists "product images public read" on storage.objects;
create policy "product images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product images owner insert" on storage.objects;
create policy "product images owner insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_owner());

drop policy if exists "product images owner update" on storage.objects;
create policy "product images owner update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_owner())
  with check (bucket_id = 'product-images' and public.is_owner());

drop policy if exists "product images owner delete" on storage.objects;
create policy "product images owner delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_owner());

-- order-attachments: anyone can upload (anon checkout supported),
-- only owners can read/delete. Customers never need to fetch their own files
-- back; if they do later we add a 'select if path starts with their user_id'
-- policy.
drop policy if exists "order attachments public insert" on storage.objects;
create policy "order attachments public insert"
  on storage.objects for insert
  with check (bucket_id = 'order-attachments');

drop policy if exists "order attachments owner select" on storage.objects;
create policy "order attachments owner select"
  on storage.objects for select
  using (bucket_id = 'order-attachments' and public.is_owner());

drop policy if exists "order attachments owner delete" on storage.objects;
create policy "order attachments owner delete"
  on storage.objects for delete
  using (bucket_id = 'order-attachments' and public.is_owner());
