-- =====================================================
-- Migration: Update from Diar Argan to Azana Schema
-- Removes ingredients/how_to_use, adds size_guide
-- Updates currency and settings
-- =====================================================

-- =====================================================
-- 1. UPDATE PRODUCTS TABLE
-- =====================================================

-- Add size_guide columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide_ar TEXT;

-- Add Arabic fields if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits_ar TEXT[];

-- Remove old columns (ingredients and how_to_use)
-- Note: This will delete data, so backup first if needed
ALTER TABLE products DROP COLUMN IF EXISTS ingredients;
ALTER TABLE products DROP COLUMN IF EXISTS ingredients_ar;
ALTER TABLE products DROP COLUMN IF EXISTS how_to_use;
ALTER TABLE products DROP COLUMN IF EXISTS how_to_use_ar;

-- =====================================================
-- 2. UPDATE ADMIN SETTINGS
-- =====================================================

-- Update currency from EGP to MAD
UPDATE admin_settings SET value = 'MAD' WHERE key = 'currency';

-- Update store name to Azana
UPDATE admin_settings SET value = 'Azana' WHERE key = 'store_name';

-- Update support email
UPDATE admin_settings SET value = 'contact@azana.com' WHERE key = 'support_email';

-- Add/Update announcement bar with MAD currency
INSERT INTO admin_settings (key, value) VALUES
    ('announcement_bar', 'Free shipping on orders over MAD 500 | Use code ARGAN20 for 20% off'),
    ('announcement_bar_ar', 'شحن مجاني للطلبات فوق ٥٠٠ د.م | استخدم كود ARGAN20 لخصم ٢٠٪'),
    ('hero_title', 'Effortless Women''s Style'),
    ('hero_title_ar', 'أناقة المرأة العصرية'),
    ('hero_subtitle', 'Discover boutique & luxury women''s clothing – from everyday essentials to statement dresses for every occasion.'),
    ('hero_subtitle_ar', 'اكتشفي أزياء نسائية فاخرة من الفساتين إلى الإطلالات اليومية، بتصاميم مريحة وتفاصيل أنثوية مميزة.'),
    ('promo_code', 'WELCOME25'),
    ('promo_title', '25% Off Your First Outfit'),
    ('promo_title_ar', 'خصم 25% على أول إطلالة'),
    ('whatsapp_number', '+212600000000'),
    ('contact_phone', '+212600000000')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =====================================================
-- 3. ENSURE ALL NEW TABLES EXIST
-- =====================================================

-- Categories table (if not exists)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_ar TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    description_ar TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero carousel table (if not exists)
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

-- WhatsApp subscriptions table (if not exists)
CREATE TABLE IF NOT EXISTS whatsapp_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_code, phone)
);

-- Push subscriptions table (if not exists)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages table (if not exists)
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    message_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career applications table (if not exists)
CREATE TABLE IF NOT EXISTS career_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    cv_url TEXT NOT NULL,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add product_image to order_items if not exists
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT;

-- =====================================================
-- 4. CREATE INDEXES IF NOT EXISTS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_hero_carousel_active ON hero_carousel(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscriptions_active ON whatsapp_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status, created_at DESC);

-- =====================================================
-- 5. UPDATE RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

-- Public read access for hero carousel
DROP POLICY IF EXISTS "Public can view active carousel" ON hero_carousel;
CREATE POLICY "Public can view active carousel" ON hero_carousel
    FOR SELECT USING (is_active = true);

-- Admin full access for new tables
DROP POLICY IF EXISTS "Allow all for authenticated users" ON categories;
CREATE POLICY "Allow all for authenticated users" ON categories
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON hero_carousel;
CREATE POLICY "Allow all for authenticated users" ON hero_carousel
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON whatsapp_subscriptions;
CREATE POLICY "Allow all for authenticated users" ON whatsapp_subscriptions
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON push_subscriptions;
CREATE POLICY "Allow all for authenticated users" ON push_subscriptions
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON contact_messages;
CREATE POLICY "Allow all for authenticated users" ON contact_messages
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON career_applications;
CREATE POLICY "Allow all for authenticated users" ON career_applications
    FOR ALL USING (true);

-- =====================================================
-- 6. ADD TRIGGERS FOR NEW TABLES
-- =====================================================

-- Trigger for categories updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for hero_carousel updated_at
DROP TRIGGER IF EXISTS update_hero_carousel_updated_at ON hero_carousel;
CREATE TRIGGER update_hero_carousel_updated_at BEFORE UPDATE ON hero_carousel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for career_applications updated_at
DROP TRIGGER IF EXISTS update_career_applications_updated_at ON career_applications;
CREATE TRIGGER update_career_applications_updated_at BEFORE UPDATE ON career_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. SETUP STORAGE BUCKET
-- =====================================================

-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Create storage policies for product-images bucket
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

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Your database has been updated to the Azana schema.
-- Old fields (ingredients, how_to_use) have been removed.
-- New field (size_guide) has been added.
-- Currency and settings have been updated to MAD and Azana branding.
-- Storage bucket 'product-images' has been created with proper permissions.