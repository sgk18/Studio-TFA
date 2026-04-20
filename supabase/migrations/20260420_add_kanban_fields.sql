-- Add dimensions and estimated price to custom_orders for Kanban cards
ALTER TABLE public.custom_orders 
ADD COLUMN IF NOT EXISTS dimensions text;

ALTER TABLE public.custom_orders 
ADD COLUMN IF NOT EXISTS estimated_price numeric(12,2);
