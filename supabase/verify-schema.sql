-- verify-schema.sql
-- Idempotent schema verification and creation for Studio TFA
-- Execute this script in your Supabase SQL Editor.

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text default 'customer',
  created_at timestamptz default now()
);

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS role text default 'customer',
  ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

-- 2. products
CREATE TABLE IF NOT EXISTS public.products (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text,
  description text,
  story text,
  price numeric,
  compare_at_price numeric,
  category text,
  images jsonb default '[]'::jsonb,
  stock integer default 0,
  is_customisable boolean default false,
  customisable_fields jsonb,
  is_custom_order boolean default false,
  is_digital boolean default false,
  download_url text,
  tags text[],
  meta_title text,
  meta_description text,
  is_archived boolean default false,
  created_at timestamptz default now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS story text,
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS compare_at_price numeric,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS images jsonb,
  ADD COLUMN IF NOT EXISTS stock integer,
  ADD COLUMN IF NOT EXISTS is_customisable boolean,
  ADD COLUMN IF NOT EXISTS customisable_fields jsonb,
  ADD COLUMN IF NOT EXISTS is_custom_order boolean,
  ADD COLUMN IF NOT EXISTS is_digital boolean,
  ADD COLUMN IF NOT EXISTS download_url text,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS is_archived boolean,
  ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

-- 3. orders
CREATE TABLE IF NOT EXISTS public.orders (
  id text primary key default gen_random_uuid()::text,
  order_number text,
  user_id uuid,
  guest_email text,
  items jsonb,
  subtotal numeric,
  discount_amount numeric,
  shipping_amount numeric,
  total numeric,
  coupon_code text,
  payment_id text,
  payment_status text,
  status text,
  shipping_address jsonb,
  tracking_number text,
  is_gift boolean default false,
  gift_message text,
  created_at timestamptz default now()
);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS items jsonb,
  ADD COLUMN IF NOT EXISTS subtotal numeric,
  ADD COLUMN IF NOT EXISTS discount_amount numeric,
  ADD COLUMN IF NOT EXISTS shipping_amount numeric,
  ADD COLUMN IF NOT EXISTS total numeric,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS is_gift boolean default false,
  ADD COLUMN IF NOT EXISTS gift_message text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

-- 4. reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id text primary key default gen_random_uuid()::text,
  product_id text,
  user_id uuid,
  rating integer,
  title text,
  body text,
  admin_reply text,
  admin_reply_at timestamptz,
  is_verified boolean default false,
  is_approved boolean default false,
  created_at timestamptz default now()
);

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS rating integer,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS admin_reply text,
  ADD COLUMN IF NOT EXISTS admin_reply_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_verified boolean default false,
  ADD COLUMN IF NOT EXISTS is_approved boolean default false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

-- 5. commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid,
  product_id text,
  vision_text text,
  colour_palette text[],
  dimensions text,
  reference_urls text[],
  estimated_price numeric,
  status text,
  admin_notes text,
  customisations jsonb,
  created_at timestamptz default now()
);

-- 6. discount_codes
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id text primary key default gen_random_uuid()::text,
  code text unique,
  type text,
  value numeric,
  min_order numeric,
  max_uses integer,
  used_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true
);

-- 7. gift_cards
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id text primary key default gen_random_uuid()::text,
  code text unique,
  initial_value numeric,
  remaining_value numeric,
  purchased_by uuid,
  recipient_email text,
  expires_at timestamptz,
  is_redeemed boolean default false
);

-- 8. addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id text primary key default gen_random_uuid()::text,
  user_id uuid,
  label text,
  full_name text,
  line1 text,
  line2 text,
  city text,
  state text,
  pincode text,
  country text,
  is_default boolean default false
);

-- 9. guest_artists
CREATE TABLE IF NOT EXISTS public.guest_artists (
  id text primary key default gen_random_uuid()::text,
  name text,
  bio text,
  photo_url text,
  instagram_url text,
  product_ids text[],
  is_active boolean default true
);

-- 10. testimonies
CREATE TABLE IF NOT EXISTS public.testimonies (
  id text primary key default gen_random_uuid()::text,
  user_id uuid,
  content text,
  type text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- 11. newsletter_subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id text primary key default gen_random_uuid()::text,
  email text unique,
  source text,
  subscribed_at timestamptz default now()
);

-- 12. blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id text primary key default gen_random_uuid()::text,
  title text,
  slug text unique,
  body_mdx text,
  category text,
  related_product_ids text[],
  cover_image text,
  is_published boolean default false,
  published_at timestamptz
);
