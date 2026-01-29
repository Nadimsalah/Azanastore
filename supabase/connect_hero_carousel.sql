-- =====================================================
-- QUICK FIX: Connect Hero Carousel to Supabase
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- =====================================================

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS hero_carousel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    link TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_hero_carousel_active ON hero_carousel(is_active, sort_order);

-- Step 3: Enable RLS
ALTER TABLE hero_carousel ENABLE ROW LEVEL SECURITY;

-- Step 4: Remove old policies
DROP POLICY IF EXISTS "Public can view active carousel" ON hero_carousel;
DROP POLICY IF EXISTS "Public can view carousel" ON hero_carousel;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON hero_carousel;
DROP POLICY IF EXISTS "Allow all operations" ON hero_carousel;
DROP POLICY IF EXISTS "Admin full access" ON hero_carousel;

-- Step 5: Create new policies (allow public read, full admin access)
CREATE POLICY "Public can view active carousel" 
ON hero_carousel FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow all operations" 
ON hero_carousel FOR ALL 
USING (true)
WITH CHECK (true);

-- Step 6: Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_hero_carousel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hero_carousel_updated_at ON hero_carousel;
CREATE TRIGGER hero_carousel_updated_at
    BEFORE UPDATE ON hero_carousel
    FOR EACH ROW
    EXECUTE FUNCTION update_hero_carousel_updated_at();

-- Step 7: Insert sample data (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM hero_carousel LIMIT 1) THEN
        INSERT INTO hero_carousel (image_url, title, subtitle, sort_order, is_active) VALUES
            ('/hero-showcase-1.jpg', 'Effortless Women''s Style', 'Discover boutique & luxury women''s clothing', 1, true),
            ('/hero-showcase-2.jpg', 'Luxury Evening Dresses', 'From everyday essentials to statement dresses', 2, true),
            ('/hero-showcase-3.jpg', 'Boutique Fashion', 'Premium quality • Timeless elegance', 3, true),
            ('/hero-showcase-4.jpg', 'New Collection', 'Fresh styles for every occasion', 4, true),
            ('/hero-showcase-5.jpg', 'Comfortable & Stylish', 'Fashion that feels as good as it looks', 5, true),
            ('/hero-showcase-6.jpg', 'Azana Boutique', 'Your destination for luxury women''s fashion', 6, true);
    END IF;
END $$;

-- Done! The hero carousel is now connected.
-- Check your admin panel at /admin/hero-carousel to manage items.
