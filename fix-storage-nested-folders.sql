-- =====================================================
-- FIX STORAGE POLICIES FOR NESTED FOLDERS
-- =====================================================
-- This fixes the storage policies to allow uploads to:
-- - avatars/{user_id}/*
-- - covers/{user_id}/*
-- - products/{user_id}/*
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mvfcbokbdkkjkijcmucg/sql/new
-- =====================================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can upload product images" ON storage.objects;

-- Create updated storage policies with nested folder support
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'covers' AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'products' AND (storage.foldername(name))[2] = auth.uid()::text AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('seller', 'farmer')
      ))
    )
  );

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'covers' AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'products' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'covers' AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'products' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );
