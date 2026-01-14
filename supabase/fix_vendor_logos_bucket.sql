-- Complete fix for vendor logos storage bucket
-- This script will clean up and recreate everything
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing policies for vendor-logos bucket
DROP POLICY IF EXISTS "Vendors can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can upload their logos" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update their logos" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete their logos" ON storage.objects;

-- Step 2: Delete the bucket if it exists (this will fail if bucket has files, which is fine)
DELETE FROM storage.buckets WHERE id = 'vendor-logos';

-- Step 3: Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-logos',
  'vendor-logos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
);

-- Step 4: Create simple, permissive policies
CREATE POLICY "Anyone authenticated can upload logos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'vendor-logos');

CREATE POLICY "Anyone authenticated can update logos" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'vendor-logos');

CREATE POLICY "Anyone authenticated can delete logos" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'vendor-logos');

CREATE POLICY "Anyone can view logos" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'vendor-logos');
