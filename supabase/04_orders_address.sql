-- BareNest — split city + pincode out of customer_address so admin can
-- filter, sort, and dispatch by delivery zone. Run AFTER 02_admin_storage.sql.
-- Idempotent: safe to re-run.

alter table public.orders add column if not exists customer_city text;
alter table public.orders add column if not exists customer_pincode text;
