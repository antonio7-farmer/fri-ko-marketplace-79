-- =====================================================
-- ADD RESERVATIONS TABLE
-- =====================================================
-- This adds a reservations table to track product reservations
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mvfcbokbdkkjkijcmucg/sql/new
-- =====================================================

-- Drop table if it exists (for clean migration)
DROP TABLE IF EXISTS public.reservations CASCADE;

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_reservations_buyer_id ON public.reservations(buyer_id);
CREATE INDEX idx_reservations_seller_id ON public.reservations(seller_id);
CREATE INDEX idx_reservations_product_id ON public.reservations(product_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reservations
CREATE POLICY "Users can view own reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update reservations for their products"
  ON public.reservations FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Buyers can cancel own pending reservations"
  ON public.reservations FOR UPDATE
  USING (auth.uid() = buyer_id AND status = 'pending')
  WITH CHECK (auth.uid() = buyer_id);

-- Enable realtime for reservations
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;