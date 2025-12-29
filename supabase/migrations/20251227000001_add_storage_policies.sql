-- Add storage policies for profiles bucket
-- Allow authenticated users to upload avatars, covers, and farm pictures

-- Policy for uploading avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy for uploading covers
CREATE POLICY "Users can upload covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'covers'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy for uploading farm pictures
CREATE POLICY "Users can upload farm pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'farm-pictures'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to view their own uploaded files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (
    (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text
    OR (storage.foldername(name))[1] = 'covers' AND (storage.foldername(name))[2] = auth.uid()::text
    OR (storage.foldername(name))[1] = 'farm-pictures' AND (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (
    (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text
    OR (storage.foldername(name))[1] = 'covers' AND (storage.foldername(name))[2] = auth.uid()::text
    OR (storage.foldername(name))[1] = 'farm-pictures' AND (storage.foldername(name))[2] = auth.uid()::text
  )
);