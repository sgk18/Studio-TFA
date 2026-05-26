BEGIN;

-- 1. Normalize existing roles: Convert staff and wholesale to customer.
-- Preserve admin.
UPDATE public.profiles
SET role = 'customer'
WHERE role NOT IN ('admin');

-- 2. Drop the old role check constraint.
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Create the new role check constraint (customer | admin).
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (
  role IN ('customer', 'admin')
);

-- 4. Ensure default is customer.
ALTER TABLE public.profiles
ALTER COLUMN role SET DEFAULT 'customer';

-- 5. Add/ensure performance indexes.
CREATE INDEX IF NOT EXISTS idx_profiles_role
ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at
ON public.profiles(created_at);

COMMIT;
