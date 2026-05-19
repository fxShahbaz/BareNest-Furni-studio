-- Adds per-product tax fields.
-- gst_rate: numeric percentage (e.g. 18.00 for 18%).
-- tax_inclusive: true = listed price already includes GST, false = GST added on top.

alter table public.products
  add column if not exists gst_rate numeric(5,2) not null default 18,
  add column if not exists tax_inclusive boolean not null default true;

-- Sanity: keep rates within a reasonable range so a typo can't break the cart UI.
alter table public.products
  drop constraint if exists products_gst_rate_range;

alter table public.products
  add constraint products_gst_rate_range
  check (gst_rate >= 0 and gst_rate <= 50);
