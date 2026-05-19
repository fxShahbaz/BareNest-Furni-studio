-- Invoice & tax-invoice fields. Per the BareNest decision, invoices are
-- derived from orders (no separate invoices table). We add a few helper
-- columns so each order can carry a stable invoice number once admin
-- clicks Generate, and so the printable invoice has all the pieces a
-- GST tax invoice requires.

-- Per-order assignments. invoice_number is set once and never changes
-- (stable for reprints). NULL means "not yet generated".
alter table public.orders
  add column if not exists invoice_number text unique,
  add column if not exists invoice_generated_at timestamptz,
  add column if not exists customer_gstin text;

-- Per-product HSN code (required line item on a GST tax invoice).
-- Optional in the schema so legacy rows continue to work; the admin
-- form will surface it as a free-text field.
alter table public.products
  add column if not exists hsn_code text;

-- Sequence + format function for human-readable invoice numbers.
-- Numbers look like "BN-2026-0001". The sequence is shared across years;
-- we only embed the current year for readability, not for resetting.
create sequence if not exists public.invoice_seq start 1;

create or replace function public.next_invoice_number()
returns text
language sql
as $$
  select 'BN-' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY')
              || '-' || lpad(nextval('public.invoice_seq')::text, 4, '0');
$$;
