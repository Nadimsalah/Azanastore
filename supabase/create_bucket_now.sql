-- =====================================================
-- QUICK FIX: Create product-images Storage Bucket
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- =====================================================

-- Step 1: Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Remove old policies if they exist
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Step 3: Create new policies (allow public access for PIN-based admin)
CREATE POLICY "Public Select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Public Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Public Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');

-- Done! The bucket should now be available.
-- Try uploading an image again in the admin panel.
