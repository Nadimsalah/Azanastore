# Supabase Database Schema

This directory contains the database schema for the Rateb E-Commerce platform.

## Setup Instructions

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the Schema**
   - Copy the contents of `schema.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

## Database Structure

### Core Tables

#### `products`
- Stores all product information
- Includes pricing, stock, images, and benefits
- Supports multiple categories (face, body, hair, gift)

#### `product_variants`
- Optional variants for products (sizes, colors, etc.)
- Each variant has its own SKU and stock

#### `customers`
- Customer profiles with contact information
- Tracks total orders and spending
- Status field for blocking/activating accounts

#### `orders`
- Complete order information
- Links to customers
- Includes shipping address and status tracking

#### `order_items`
- Individual items within each order
- Preserves product details at time of purchase

#### `order_timeline`
- Tracks order status changes
- Useful for order history and tracking

#### `admin_settings`
- Key-value store for admin configuration
- Includes store name, email, PIN, etc.

#### `product_cross_sells`
- Manages "You May Also Like" relationships
- Many-to-many relationship between products

## Security

- **Row Level Security (RLS)** is enabled on all tables
- Public can view active products (for storefront)
- Admin operations require authentication (currently open - should be restricted in production)

## Sample Data

The schema includes sample data for:
- 3 products (Argan Oil, Face Serum, Body Butter)
- 1 customer

## Next Steps

After running the schema:
1. Update the admin PIN in `admin_settings` table
2. Set up proper authentication for admin access
3. Configure RLS policies based on your auth setup
4. Add your actual product data
