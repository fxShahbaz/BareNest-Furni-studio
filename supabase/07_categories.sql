-- Categories registry — single source of truth shared by the admin filter
-- chips and the product form's category dropdown. The products.category
-- column stays free-text (no FK) so existing rows don't break if a category
-- is renamed/removed; the table is purely the admin's "known categories" list.

create table if not exists public.categories (
  slug text primary key,
  label text not null,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

-- Public read so the storefront can list rooms without service-role.
drop policy if exists "categories are public" on public.categories;
create policy "categories are public"
  on public.categories for select
  using (true);

-- Seed the 10 categories that are currently hardcoded in the TS form.
-- on conflict do nothing keeps this idempotent.
insert into public.categories (slug, label) values
  ('beds',        'Beds'),
  ('wardrobes',   'Wardrobes'),
  ('dressing',    'Dressing tables'),
  ('sofas',       'Sofas'),
  ('dining',      'Dining tables'),
  ('crockery',    'Crockery units'),
  ('bookshelves', 'Bookshelves'),
  ('shoerack',    'Shoe racks'),
  ('office',      'Office'),
  ('conference',  'Conference')
on conflict (slug) do nothing;
