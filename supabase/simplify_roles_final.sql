BEGIN;

/* ==========================================================
   1. ROLE NORMALIZATION & CONSTRAINTS
   ========================================================== */

-- Convert any legacy roles (staff, wholesale, moderator, etc.) to 'customer'
-- We only preserve the 'admin' role.
UPDATE public.profiles
SET role = 'customer'
WHERE role NOT IN ('admin');

-- Drop old check constraint if it exists
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new strict constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('customer', 'admin'));

-- Ensure 'customer' is the default for new signups
ALTER TABLE public.profiles
ALTER COLUMN role SET DEFAULT 'customer';


/* ==========================================================
   2. UPDATE HELPER FUNCTIONS
   ========================================================== */

-- Update the has_role helper to be clean
CREATE OR REPLACE FUNCTION public.has_role(role_names text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = ANY(role_names)
  );
$$;


/* ==========================================================
   3. REFACTOR RLS POLICIES (REMOVE STAFF/WHOLESALE)
   ========================================================== */

-- Products: Admin only management
DROP POLICY IF EXISTS products_manage_admin ON public.products;
CREATE POLICY products_manage_admin
ON public.products FOR ALL
TO authenticated
USING (public.has_role(ARRAY['admin']))
WITH CHECK (public.has_role(ARRAY['admin']));

-- Profiles: Admin access
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
CREATE POLICY profiles_select_self
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.has_role(ARRAY['admin']));

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.has_role(ARRAY['admin']))
WITH CHECK (id = auth.uid() OR public.has_role(ARRAY['admin']));

-- Orders: Admin access
DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(ARRAY['admin']));

DROP POLICY IF EXISTS orders_update_admin ON public.orders;
CREATE POLICY orders_update_admin
ON public.orders FOR UPDATE
TO authenticated
USING (public.has_role(ARRAY['admin']))
WITH CHECK (public.has_role(ARRAY['admin']));

-- Custom Orders: Admin access
DROP POLICY IF EXISTS custom_orders_select_own ON public.custom_orders;
CREATE POLICY custom_orders_select_own
ON public.custom_orders FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(ARRAY['admin']));

DROP POLICY IF EXISTS custom_orders_update_admin ON public.custom_orders;
CREATE POLICY custom_orders_update_admin
ON public.custom_orders FOR UPDATE
TO authenticated
USING (public.has_role(ARRAY['admin']))
WITH CHECK (public.has_role(ARRAY['admin']));


/* ==========================================================
   4. REFACTOR ADMIN RPCs
   ========================================================== */

-- Update Admin Users Fetching RPC
CREATE OR REPLACE FUNCTION public.get_admin_users(
  search_query text DEFAULT NULL,
  role_filter text DEFAULT NULL,
  status_filter text DEFAULT NULL,
  provider_filter text DEFAULT NULL,
  page_limit int DEFAULT 10,
  page_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  signup_date timestamptz,
  last_sign_in_at timestamptz,
  banned_until timestamptz,
  provider text,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(ARRAY['admin']) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT
      p.id,
      p.email,
      p.full_name,
      p.role,
      p.created_at AS signup_date,
      au.last_sign_in_at,
      au.banned_until,
      (au.raw_app_meta_data->>'provider')::text AS provider
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE (search_query IS NULL OR p.email ILIKE '%' || search_query || '%' OR p.full_name ILIKE '%' || search_query || '%' OR p.id::text ILIKE '%' || search_query || '%')
      AND (role_filter IS NULL OR role_filter = 'all' OR p.role = role_filter)
      AND (status_filter IS NULL OR status_filter = 'all' OR 
           (status_filter = 'active' AND (au.banned_until IS NULL OR au.banned_until < NOW())) OR 
           (status_filter = 'disabled' AND au.banned_until > NOW()))
      AND (provider_filter IS NULL OR provider_filter = 'all' OR (au.raw_app_meta_data->>'provider')::text = provider_filter)
  )
  SELECT 
    f.id, f.email, f.full_name, f.role, f.signup_date, f.last_sign_in_at, f.banned_until, f.provider,
    (SELECT COUNT(*) FROM filtered)::bigint AS total_count
  FROM filtered f
  ORDER BY f.signup_date DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

-- Update User Details RPC
CREATE OR REPLACE FUNCTION public.get_admin_user_details(
  target_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  IF NOT public.has_role(ARRAY['admin']) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'full_name', p.full_name,
    'role', p.role,
    'phone', p.phone,
    'default_shipping_address', p.default_shipping_address,
    'signup_date', p.created_at,
    'last_sign_in_at', au.last_sign_in_at,
    'banned_until', au.banned_until,
    'provider', au.raw_app_meta_data->>'provider',
    'providers', au.raw_app_meta_data->>'providers',
    'user_metadata', au.raw_user_meta_data,
    'order_count', COALESCE((SELECT COUNT(*) FROM public.orders o WHERE o.user_id = p.id), 0)
  ) INTO v_result
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.id = target_user_id;

  RETURN v_result;
END;
$$;


/* ==========================================================
   5. PERFORMANCE INDEXES
   ========================================================== */

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

COMMIT;
