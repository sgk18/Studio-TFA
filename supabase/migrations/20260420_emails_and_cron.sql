
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. ABANDONED CARTS TABLE (Ensure it exists with correct indices)
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  guest_email  text,
  items        jsonb NOT NULL DEFAULT '[]',
  email_sent   boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS abandoned_carts_user_unique ON public.abandoned_carts (user_id) WHERE user_id IS NOT NULL;

-- 3. WEBHOOKS TO CALL EDGE FUNCTION
-- Helper to get service role key (must be set in vault or handled via Supabase dashboard ideally)
-- For this SQL, we assume the URL is known and we use a generic trigger pattern.

-- Create a generic function to call our email-service
CREATE OR REPLACE FUNCTION public.trigger_email_service()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  trigger_type TEXT;
BEGIN
  -- Determine trigger type based on table and condition
  IF (TG_TABLE_NAME = 'orders' AND OLD.status = 'pending' AND NEW.status = 'paid') THEN
    trigger_type := 'order_confirmation';
  ELSIF (TG_TABLE_NAME = 'orders' AND NEW.status = 'shipped' AND NEW.tracking_number IS NOT NULL) THEN
    trigger_type := 'shipping_notification';
  ELSIF (TG_TABLE_NAME = 'commissions' AND TG_OP = 'INSERT') THEN
    trigger_type := 'admin_commission_alert';
  ELSIF (TG_TABLE_NAME = 'reviews' AND NEW.admin_reply IS NOT NULL AND (OLD.admin_reply IS NULL OR OLD.admin_reply <> NEW.admin_reply)) THEN
    trigger_type := 'review_reply';
  ELSIF (TG_TABLE_NAME = 'gift_cards' AND TG_OP = 'INSERT') THEN
    trigger_type := 'gift_card_delivery';
  ELSE
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'type', trigger_type,
    'record', row_to_json(NEW)::jsonb,
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END
  );

  -- Perform the HTTP request asynchronously via pg_net
  -- Note: [PROJECT_URL] and [SERVICE_ROLE_KEY] must be replaced with actual values
  -- Or typically handled via Supabase Dashboard UI for Webhooks.
  PERFORM net.http_post(
    url := 'https://' || current_setting('app.settings.supabase_url') || '/functions/v1/email-service',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATTACH TRIGGERS

-- Orders: Confirmation & Shipping
DROP TRIGGER IF EXISTS tr_order_emails ON public.orders;
CREATE TRIGGER tr_order_emails
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_email_service();

-- Commissions: Admin Alert
DROP TRIGGER IF EXISTS tr_commission_alert ON public.commissions;
CREATE TRIGGER tr_commission_alert
  AFTER INSERT ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_email_service();

-- Reviews: Reply Notification
DROP TRIGGER IF EXISTS tr_review_reply ON public.reviews;
CREATE TRIGGER tr_review_reply
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_email_service();

-- Gift Cards: Delivery
DROP TRIGGER IF EXISTS tr_gift_card_delivery ON public.gift_cards;
CREATE TRIGGER tr_gift_card_delivery
  AFTER INSERT ON public.gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_email_service();

-- 5. CRON JOB FOR ABANDONED CARTS

-- Schedule cron to run every hour
SELECT cron.schedule(
  'abandoned-cart-recovery',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://' || current_setting('app.settings.supabase_url') || '/functions/v1/email-service',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"type": "recovery_cron"}'::jsonb
  )
  $$
);

-- Note: To make current_setting() work, you need to set them in the DB:
-- ALTER DATABASE postgres SET "app.settings.supabase_url" = 'your-project.supabase.co';
-- ALTER DATABASE postgres SET "app.settings.service_role_key" = 'your-service-role-key';
