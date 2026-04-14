-- ============================================================
-- Studio TFA — Additive Schema Migration
-- Run this in Supabase SQL Editor (once only).
-- All statements use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- so they are safe to re-run.
-- ============================================================

-- ─────────────────────────────────────
-- 1. REVIEWS — add moderation + reply fields
-- ─────────────────────────────────────
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS title            text,
  ADD COLUMN IF NOT EXISTS is_approved      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_reply      text,
  ADD COLUMN IF NOT EXISTS admin_reply_at   timestamptz;

-- Index for fast storefront queries (approved reviews per product)
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved
  ON public.reviews (product_id, is_approved);

-- ─────────────────────────────────────
-- 2. PRODUCTS — add customisation + archiving fields
-- ─────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_customisable      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS customisable_fields  jsonb,
  ADD COLUMN IF NOT EXISTS compare_at_price     numeric,
  ADD COLUMN IF NOT EXISTS is_archived          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS story                text,
  ADD COLUMN IF NOT EXISTS tags                 text[],
  ADD COLUMN IF NOT EXISTS meta_title           text,
  ADD COLUMN IF NOT EXISTS meta_description     text;

-- ─────────────────────────────────────
-- 3. ORDERS — add gift + tracking fields
-- ─────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number  text,
  ADD COLUMN IF NOT EXISTS is_gift          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gift_message     text;

-- ─────────────────────────────────────
-- 4. New table: DISCOUNT_CODES
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  type        text NOT NULL CHECK (type IN ('percent', 'flat')),
  value       numeric NOT NULL CHECK (value > 0),
  min_order   numeric NOT NULL DEFAULT 0,
  max_uses    integer,
  used_count  integer NOT NULL DEFAULT 0,
  expires_at  timestamptz,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read active codes (needed for cart validation)
CREATE POLICY IF NOT EXISTS "discount_codes_public_read"
  ON public.discount_codes FOR SELECT
  USING (is_active = true);

-- Only admins can write
CREATE POLICY IF NOT EXISTS "discount_codes_admin_write"
  ON public.discount_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─────────────────────────────────────
-- 5. New table: GIFT_CARDS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text NOT NULL UNIQUE,
  initial_value    numeric NOT NULL CHECK (initial_value > 0),
  remaining_value  numeric NOT NULL,
  purchased_by     uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  recipient_email  text NOT NULL,
  expires_at       timestamptz,
  is_redeemed      boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Purchaser or recipient can read their own card
CREATE POLICY IF NOT EXISTS "gift_cards_owner_read"
  ON public.gift_cards FOR SELECT
  USING (
    purchased_by = auth.uid()
    OR recipient_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Admins can read all
CREATE POLICY IF NOT EXISTS "gift_cards_admin_read"
  ON public.gift_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert/update/delete
CREATE POLICY IF NOT EXISTS "gift_cards_admin_write"
  ON public.gift_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─────────────────────────────────────
-- 6. New table: ABANDONED_CARTS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  guest_email  text,
  items        jsonb NOT NULL DEFAULT '[]',
  email_sent   boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS abandoned_carts_user_unique
  ON public.abandoned_carts (user_id)
  WHERE user_id IS NOT NULL;

-- RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "abandoned_carts_owner"
  ON public.abandoned_carts FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "abandoned_carts_admin"
  ON public.abandoned_carts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─────────────────────────────────────
-- 7. Reviews RLS — add moderation policies
-- ─────────────────────────────────────

-- Public can only see approved reviews
DROP POLICY IF EXISTS "reviews_public_select" ON public.reviews;
CREATE POLICY "reviews_public_select"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

-- Authenticated users can insert their own review
DROP POLICY IF EXISTS "reviews_owner_insert" ON public.reviews;
CREATE POLICY "reviews_owner_insert"
  ON public.reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own review
DROP POLICY IF EXISTS "reviews_owner_delete" ON public.reviews;
CREATE POLICY "reviews_owner_delete"
  ON public.reviews FOR DELETE
  USING (user_id = auth.uid());

-- Admins can update any review (for approval + reply)
DROP POLICY IF EXISTS "reviews_admin_update" ON public.reviews;
CREATE POLICY "reviews_admin_update"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─────────────────────────────────────
-- 8. Helper function: is_admin()
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
