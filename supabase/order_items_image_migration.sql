-- Add product_image column to order_items to persist the image at time of order
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT;
