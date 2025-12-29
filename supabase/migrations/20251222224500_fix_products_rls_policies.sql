-- Fix products RLS policies to allow sellers and farmers to insert products
-- Drop existing policies
DROP POLICY IF EXISTS "Sellers can insert own products" ON products;
DROP POLICY IF EXISTS "Sellers can update own products" ON products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON products;

-- Create improved policies that check user role from profiles
CREATE POLICY "Sellers and farmers can insert own products"
ON products
FOR INSERT
WITH CHECK (
  auth.uid() = seller_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('seller', 'farmer')
  )
);

CREATE POLICY "Sellers and farmers can update own products"
ON products
FOR UPDATE
USING (
  auth.uid() = seller_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('seller', 'farmer')
  )
);

CREATE POLICY "Sellers and farmers can delete own products"
ON products
FOR DELETE
USING (
  auth.uid() = seller_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('seller', 'farmer')
  )
);

-- Also add storage policies for products folder if not exists
DO $$
BEGIN
  -- Check if products bucket exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profiles') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);
  END IF;
END $$;

-- Allow sellers to upload product images to their folder in profiles bucket
CREATE POLICY "Sellers can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'products'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('seller', 'farmer')
  )
);
