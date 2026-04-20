-- P-04: Add first-login tracking columns to profiles
-- Run this in the Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_first_login boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;

-- P-04: Seed WELCOME10 discount code if it doesn't exist
INSERT INTO public.discount_codes (code, type, value, min_order, max_uses, used_count, is_active, expires_at)
VALUES ('WELCOME10', 'percent', 10, 0, 9999, 0, true, null)
ON CONFLICT (code) DO NOTHING;
