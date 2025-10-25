-- Add price column to trades table
ALTER TABLE public.trades 
ADD COLUMN price numeric NOT NULL DEFAULT 0;