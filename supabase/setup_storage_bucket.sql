-- =====================================================
-- Setup Storage Bucket for Product Images
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- 3. Create permissive policies for the 'product-images' bucket
-- These allow public read access and anonymous uploads (for PIN-based admin)

-- Allow anyone to view/download images
CREATE POLICY "Public Select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Allow anyone to upload images (needed for PIN-based admin)
CREATE POLICY "Public Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to update images
CREATE POLICY "Public Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images');

-- Allow anyone to delete images
CREATE POLICY "Public Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');

-- =====================================================
-- Verification Query (optional - run to check)
-- =====================================================
-- SELECT * FROM storage.buckets WHERE id = 'product-images';
