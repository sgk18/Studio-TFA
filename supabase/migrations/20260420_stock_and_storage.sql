-- 20260420_stock_and_storage.sql
-- Studio TFA: Pre-Launch Verification Fixes (Phase 1)

-- 1. Create missing storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('commission-references', 'commission-references', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies

-- product-images (Public Read, Admin Write)
CREATE POLICY "Public Read Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload Product Images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images' AND 
    public.is_admin()
  );

-- commission-references (Owner Read, Admin Read, Owner Write)
CREATE POLICY "Owner/Admin Read Commission Refs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'commission-references' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR 
      public.is_admin()
    )
  );

CREATE POLICY "Owner Upload Commission Refs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'commission-references' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- avatars (Public Read, Owner Write)
CREATE POLICY "Public Read Avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Owner Upload Avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Stock Decrement Trigger Logic

CREATE OR REPLACE FUNCTION public.handle_stock_decrement()
RETURNS TRIGGER AS $$
DECLARE
  item record;
BEGIN
  -- Only trigger when status changes from 'pending' (or null) to 'paid'
  -- OR when payment_status changes to 'captured'
  IF (NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status <> 'paid')) OR
     (NEW.payment_status = 'captured' AND (OLD.payment_status IS NULL OR OLD.payment_status <> 'captured'))
  THEN
    -- The 'items' column is a JSONB array of objects: { "product_id": "...", "quantity": 1 }
    FOR item IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(product_id text, quantity int)
    LOOP
      UPDATE public.products
      SET stock = stock - item.quantity
      WHERE id = item.product_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists for idempotency
DROP TRIGGER IF EXISTS tr_order_paid_stock_decrement ON public.orders;

-- Create the trigger
CREATE TRIGGER tr_order_paid_stock_decrement
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_stock_decrement();
