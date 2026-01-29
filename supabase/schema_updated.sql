-- =====================================================
-- Azana Boutique E-Commerce Database Schema for Supabase
-- Updated: 2024 - Women's Clothing Store
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_ar TEXT, -- Arabic title
    description TEXT,
    description_ar TEXT, -- Arabic description
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- e.g., 'dresses', 'tops', 'bottoms', 'accessories'
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active'
    images TEXT[], -- Array of image URLs
    benefits TEXT[], -- Array of key benefits
    benefits_ar TEXT[], -- Arabic benefits array
    size_guide TEXT, -- Size guide information
    size_guide_ar TEXT, -- Arabic size guide
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT VARIANTS (Optional - for sizes, colors, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "XS", "S", "M", "L", "XL"
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_ar TEXT, -- Arabic category name
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    description_ar TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'blocked'
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- e.g., "ORD-7829"
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Shipping Address
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    governorate TEXT NOT NULL, -- Region/Province (e.g., "Casablanca", "Rabat")
    postal_code TEXT,
    
    -- Order Details
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Metadata
    ip_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_image TEXT, -- Store image URL for order history
    variant_name TEXT, -- e.g., "M", "L", "XL"
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Price at time of order
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER TIMELINE/HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADMIN SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
    ('store_name', 'Azana'),
    ('support_email', 'contact@azana.com'),
    ('admin_pin', '20008808'), -- CHANGE THIS IN PRODUCTION!
    ('currency', 'MAD'),
    ('default_language', 'en'),
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
    ('contact_phone', '+212600000000'),
    ('push_notifications_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- HERO CAROUSEL TABLE
-- =====================================================
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

-- =====================================================
-- WHATSAPP SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS whatsapp_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_code, phone)
);

-- =====================================================
-- PUSH NOTIFICATION SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    message_type TEXT NOT NULL, -- 'client', 'partner', 'distributor'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CAREER APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS career_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    cv_url TEXT NOT NULL, -- URL to uploaded CV file
    cover_letter TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'rejected', 'hired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CROSS-SELL RELATIONSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_cross_sells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, related_product_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_hero_carousel_active ON hero_carousel(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscriptions_active ON whatsapp_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_cross_sells ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- Public read access for products (for storefront)
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (status = 'active');

-- Public read access for categories
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

-- Public read access for hero carousel
CREATE POLICY "Public can view active carousel" ON hero_carousel
    FOR SELECT USING (is_active = true);

-- Admin full access (you'll need to set up auth for this)
-- For now, allowing all operations (you should restrict this in production)
CREATE POLICY "Allow all for authenticated users" ON products
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON product_variants
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON categories
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON customers
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON orders
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON order_items
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON order_timeline
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON admin_settings
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON product_cross_sells
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON hero_carousel
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON whatsapp_subscriptions
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON push_subscriptions
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON contact_messages
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON career_applications
    FOR ALL USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_carousel_updated_at BEFORE UPDATE ON hero_carousel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_applications_updated_at BEFORE UPDATE ON career_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, name_ar, slug, description, description_ar) VALUES
    ('Dresses', 'فساتين', 'dresses', 'Elegant dresses for every occasion', 'فساتين أنيقة لكل مناسبة'),
    ('Tops', 'بلوزات', 'tops', 'Stylish tops and blouses', 'بلوزات وقمصان عصرية'),
    ('Bottoms', 'بناطيل', 'bottoms', 'Pants, skirts, and shorts', 'بناطيل وتنانير وشورتات'),
    ('Accessories', 'إكسسوارات', 'accessories', 'Complete your look with accessories', 'أكمل إطلالتك بالإكسسوارات')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (title, title_ar, description, description_ar, sku, category, price, compare_at_price, stock, status, images, benefits, benefits_ar, size_guide, size_guide_ar) VALUES
    ('Elegant Evening Dress', 'فستان سهرة أنيق', 'A stunning evening dress perfect for special occasions', 'فستان سهرة رائع مثالي للمناسبات الخاصة', 'DRS-1001', 'dresses', 899.00, 1199.00, 15, 'active', 
     ARRAY['/placeholder.svg'], 
     ARRAY['Premium fabric', 'Flattering silhouette', 'Comfortable fit'],
     ARRAY['خامة فاخرة', 'قصة مريحة وجذابة', 'مقاس مريح'],
     'XS: Bust 32-34, Waist 24-26, Hips 34-36\nS: Bust 34-36, Waist 26-28, Hips 36-38\nM: Bust 36-38, Waist 28-30, Hips 38-40\nL: Bust 38-40, Waist 30-32, Hips 40-42\nXL: Bust 40-42, Waist 32-34, Hips 42-44',
     'XS: الصدر 32-34، الخصر 24-26، الورك 34-36\nS: الصدر 34-36، الخصر 26-28، الورك 36-38\nM: الصدر 36-38، الخصر 28-30، الورك 38-40\nL: الصدر 38-40، الخصر 30-32، الورك 40-42\nXL: الصدر 40-42، الخصر 32-34، الورك 42-44'),
    ('Classic White Blouse', 'بلوزة بيضاء كلاسيكية', 'Timeless white blouse for everyday elegance', 'بلوزة بيضاء خالدة للأناقة اليومية', 'TOP-2001', 'tops', 450.00, 550.00, 30, 'active',
     ARRAY['/placeholder.svg'],
     ARRAY['100% cotton', 'Easy care', 'Versatile styling'],
     ARRAY['100% قطن', 'سهل العناية', 'تنسيق متعدد'],
     'XS: Bust 32-34, Length 24\nS: Bust 34-36, Length 25\nM: Bust 36-38, Length 26\nL: Bust 38-40, Length 27\nXL: Bust 40-42, Length 28',
     'XS: الصدر 32-34، الطول 24\nS: الصدر 34-36، الطول 25\nM: الصدر 36-38، الطول 26\nL: الصدر 38-40، الطول 27\nXL: الصدر 40-42، الطول 28'),
    ('Tailored Trousers', 'بنطلون كاجوال', 'Comfortable and stylish trousers for work or casual wear', 'بنطلون مريح وعصري للعمل أو الاستخدام اليومي', 'BOT-3001', 'bottoms', 650.00, NULL, 25, 'active',
     ARRAY['/placeholder.svg'],
     ARRAY['Stretch fabric', 'Perfect fit', 'Professional look'],
     ARRAY['قمة مرنة', 'مقاس مثالي', 'مظهر احترافي'],
     'XS: Waist 24-26, Inseam 28\nS: Waist 26-28, Inseam 29\nM: Waist 28-30, Inseam 30\nL: Waist 30-32, Inseam 31\nXL: Waist 32-34, Inseam 32',
     'XS: الخصر 24-26، طول الساق 28\nS: الخصر 26-28، طول الساق 29\nM: الخصر 28-30، طول الساق 30\nL: الخصر 30-32، طول الساق 31\nXL: الخصر 32-34، طول الساق 32')
ON CONFLICT (sku) DO NOTHING;

-- Insert sample customer
INSERT INTO customers (name, email, phone, total_orders, total_spent) VALUES
    ('Fatima Alami', 'fatima@example.com', '+212 612 345 678', 2, 1549.00)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- STORAGE BUCKETS SETUP
-- =====================================================

-- Create the product-images bucket for storing product images, hero carousel, and CVs
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

-- Storage policies for product-images bucket
-- Allow public read access
CREATE POLICY "Public Select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Allow public upload (for PIN-based admin system)
CREATE POLICY "Public Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- Allow public update
CREATE POLICY "Public Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images');

-- Allow public delete
CREATE POLICY "Public Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');
