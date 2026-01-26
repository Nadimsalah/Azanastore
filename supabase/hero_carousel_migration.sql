-- Hero Carousel Table Migration
-- This table stores the showcase images and content for the hero section carousel

CREATE TABLE IF NOT EXISTS hero_carousel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position INTEGER NOT NULL UNIQUE CHECK (position >= 1 AND position <= 6),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_hero_carousel_position ON hero_carousel(position);
CREATE INDEX idx_hero_carousel_active ON hero_carousel(is_active);

-- Insert default showcase items
INSERT INTO hero_carousel (position, image_url, title, subtitle, is_active) VALUES
  (1, '/hero-showcase-1.jpg', 'The Secret of Moroccan Beauty', 'Pure • Natural • Timeless', true),
  (2, '/hero-showcase-2.jpg', 'Handcrafted Excellence', 'From Morocco with Love', true),
  (3, '/hero-showcase-3.jpg', 'Liquid Gold', 'Cold Pressed Argan Oil', true),
  (4, '/hero-showcase-4.jpg', 'Natural Radiance', '100% Organic • Certified', true),
  (5, '/hero-showcase-5.jpg', 'Beauty Ritual', 'Ancient Wisdom • Modern Care', true),
  (6, '/hero-showcase-6.jpg', 'Diar Argan', 'Authentic Moroccan Skincare', true)
ON CONFLICT (position) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hero_carousel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_carousel_updated_at
  BEFORE UPDATE ON hero_carousel
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_carousel_updated_at();
