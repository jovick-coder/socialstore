-- Create storage bucket for vendor logos
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-logos',
  'vendor-logos',
  true,  -- Public bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos
CREATE POLICY "Vendors can upload logos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'vendor-logos'
);

-- Allow authenticated users to update logos
CREATE POLICY "Vendors can update logos" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'vendor-logos');

-- Allow authenticated users to delete logos
CREATE POLICY "Vendors can delete logos" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'vendor-logos');

-- Allow public read access
CREATE POLICY "Public can view logos" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'vendor-logos');
