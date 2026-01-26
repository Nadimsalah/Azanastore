-- Add categories table for dynamic category management

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
    ('Face Care', 'face'),
    ('Body Care', 'body'),
    ('Hair Care', 'hair'),
    ('Gift Sets', 'gift')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all for authenticated users
CREATE POLICY "Allow all for authenticated users" ON categories
    FOR ALL USING (true);

-- Create index
CREATE INDEX idx_categories_slug ON categories(slug);
