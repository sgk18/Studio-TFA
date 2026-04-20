-- enable-rls.sql
-- Run this script in the Supabase SQL Editor to apply RLS policies.

-- 1. Enable RLS on all specified tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;


-- 2. profiles
-- Drop existing policies if needed (optional cleanup context)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Note: User insertion typically happens via a database trigger rather than Direct Client INSERT.


-- 3. orders
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_guest" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;

-- Users can SELECT their own orders
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT 
USING (user_id = auth.uid());

-- Guest orders matched by guest_email from session (Assuming passed via custom header or typically accessed via edge functions)
-- A common workaround for local RLS checks on session email when user is not authenticated:
CREATE POLICY "orders_select_guest" ON public.orders FOR SELECT 
USING (user_id IS NULL AND guest_email = current_setting('request.headers', true)::json->>'x-guest-email');

-- Admins can SELECT/UPDATE/DELETE all
CREATE POLICY "orders_admin_all" ON public.orders 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 4. reviews
DROP POLICY IF EXISTS "reviews_select_approved" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;

-- Anyone can SELECT approved reviews
CREATE POLICY "reviews_select_approved" ON public.reviews FOR SELECT 
USING (is_approved = true);

-- Authenticated users can INSERT their own review
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can DELETE only their own review
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE 
USING (user_id = auth.uid());

-- Only admins can UPDATE (which covers admin_reply, admin_reply_at, is_approved)
CREATE POLICY "reviews_admin_all" ON public.reviews 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 5. commissions
DROP POLICY IF EXISTS "commissions_select_own" ON public.commissions;
DROP POLICY IF EXISTS "commissions_insert_own" ON public.commissions;
DROP POLICY IF EXISTS "commissions_admin_all" ON public.commissions;

CREATE POLICY "commissions_select_own" ON public.commissions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "commissions_insert_own" ON public.commissions FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "commissions_admin_all" ON public.commissions 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 6. addresses
DROP POLICY IF EXISTS "addresses_all_own" ON public.addresses;

-- Users can SELECT/INSERT/UPDATE/DELETE only their own addresses
CREATE POLICY "addresses_all_own" ON public.addresses 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());


-- 7. discount_codes
DROP POLICY IF EXISTS "discount_codes_select_active" ON public.discount_codes;
DROP POLICY IF EXISTS "discount_codes_admin_all" ON public.discount_codes;

-- Anyone can SELECT active codes (for cart validation)
CREATE POLICY "discount_codes_select_active" ON public.discount_codes FOR SELECT 
USING (is_active = true);

-- Admins only can INSERT/UPDATE/DELETE
CREATE POLICY "discount_codes_admin_all" ON public.discount_codes 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 8. gift_cards
DROP POLICY IF EXISTS "gift_cards_select_own" ON public.gift_cards;
DROP POLICY IF EXISTS "gift_cards_admin_all" ON public.gift_cards;

-- Users can SELECT cards they purchased or that match their email
CREATE POLICY "gift_cards_select_own" ON public.gift_cards FOR SELECT 
USING (
  purchased_by = auth.uid() OR 
  recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can SELECT all (and presumably update/delete if needed, but request specified SELECT all)
CREATE POLICY "gift_cards_admin_all" ON public.gift_cards 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 9. products
DROP POLICY IF EXISTS "products_select_non_archived" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;

-- Public SELECT on non-archived products
CREATE POLICY "products_select_non_archived" ON public.products FOR SELECT 
USING (is_archived = false);

-- Admins only can INSERT/UPDATE/DELETE
CREATE POLICY "products_admin_all" ON public.products 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 10. testimonies
DROP POLICY IF EXISTS "testimonies_select_approved" ON public.testimonies;
DROP POLICY IF EXISTS "testimonies_insert_own" ON public.testimonies;
DROP POLICY IF EXISTS "testimonies_admin_all" ON public.testimonies;

-- Public SELECT on approved testimonies
CREATE POLICY "testimonies_select_approved" ON public.testimonies FOR SELECT 
USING (is_approved = true);

-- Authenticated users can INSERT
CREATE POLICY "testimonies_insert_own" ON public.testimonies FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins can UPDATE is_approved (using an ALL policy for simplicity to grant access)
CREATE POLICY "testimonies_admin_all" ON public.testimonies 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
