-- Studio TFA: profile module upgrade
-- Adds default shipping address storage for authenticated customers.

alter table public.profiles
  add column if not exists default_shipping_address jsonb not null default '{}'::jsonb;
