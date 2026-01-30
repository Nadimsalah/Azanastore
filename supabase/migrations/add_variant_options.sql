-- Migration to add size and color support to product variants

-- Add size and color columns to product_variants table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'size') THEN
        ALTER TABLE product_variants ADD COLUMN size TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'color') THEN
        ALTER TABLE product_variants ADD COLUMN color TEXT;
    END IF;
END $$;

-- Update RLS policies to ensure variants are readable
CREATE POLICY "Public can view active product variants" ON product_variants
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.status = 'active'
    ));
