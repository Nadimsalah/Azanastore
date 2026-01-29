-- =====================================================
-- Setup Hero Carousel Table and Connect to Supabase
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create hero_carousel table if it doesn't exist
CREATE TABLE IF NOT EXISTS hero_carousel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    link TEXT, -- Optional link URL
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hero_carousel_active ON hero_carousel(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_hero_carousel_sort_order ON hero_carousel(sort_order);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE hero_carousel ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view active carousel" ON hero_carousel;
DROP POLICY IF EXISTS "Public can view carousel" ON hero_carousel;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON hero_carousel;
DROP POLICY IF EXISTS "Admin full access" ON hero_carousel;

-- 5. Create RLS policies
-- Public can view active carousel items
CREATE POLICY "Public can view active carousel" 
ON hero_carousel FOR SELECT 
USING (is_active = true);

-- Allow all operations (for PIN-based admin system)
-- In production, you should restrict this to authenticated admin users
CREATE POLICY "Allow all operations" 
ON hero_carousel FOR ALL 
USING (true)
WITH CHECK (true);

-- 6. Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hero_carousel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for updated_at
DROP TRIGGER IF EXISTS hero_carousel_updated_at ON hero_carousel;
CREATE TRIGGER hero_carousel_updated_at
    BEFORE UPDATE ON hero_carousel
    FOR EACH ROW
    EXECUTE FUNCTION update_hero_carousel_updated_at();

-- 8. Insert default hero carousel items (if table is empty)
INSERT INTO hero_carousel (image_url, title, subtitle, sort_order, is_active) 
SELECT * FROM (VALUES
    ('/hero-showcase-1.jpg', 'Effortless Women''s Style', 'Discover boutique & luxury women''s clothing', 1, true),
    ('/hero-showcase-2.jpg', 'Luxury Evening Dresses', 'From everyday essentials to statement dresses', 2, true),
    ('/hero-showcase-3.jpg', 'Boutique Fashion', 'Premium quality • Timeless elegance', 3, true),
    ('/hero-showcase-4.jpg', 'New Collection', 'Fresh styles for every occasion', 4, true),
    ('/hero-showcase-5.jpg', 'Comfortable & Stylish', 'Fashion that feels as good as it looks', 5, true),
    ('/hero-showcase-6.jpg', 'Azana Boutique', 'Your destination for luxury women''s fashion', 6, true)
) AS v(image_url, title, subtitle, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM hero_carousel);

-- 9. Verify the setup
-- Uncomment the line below to see all carousel items:
-- SELECT * FROM hero_carousel ORDER BY sort_order;

-- =====================================================
-- Setup Complete!
-- =====================================================
-- The hero carousel table is now connected to Supabase.
-- You can manage carousel items from the admin panel at /admin/hero-carousel
-- Or insert/update items directly in Supabase.
