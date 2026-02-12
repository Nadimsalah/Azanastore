-- Hero Carousel Diagnostic and Fix Script
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Check current state of hero_carousel
-- ============================================
SELECT 
    id,
    title,
    subtitle,
    CASE 
        WHEN image_url IS NULL OR image_url = '' THEN '❌ NO IMAGE'
        ELSE '✅ HAS IMAGE'
    END as image_status,
    LEFT(image_url, 50) as image_preview,
    is_active,
    COALESCE(sort_order, position, 0) as display_position,
    created_at
FROM hero_carousel
ORDER BY COALESCE(sort_order, position, 0) ASC;

-- ============================================
-- STEP 2: Count slides by status
-- ============================================
SELECT 
    COUNT(*) as total_slides,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_slides,
    COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as slides_with_images,
    COUNT(CASE WHEN is_active = true AND image_url IS NOT NULL AND image_url != '' THEN 1 END) as active_slides_with_images
FROM hero_carousel;

-- ============================================
-- STEP 3: Fix - Set all slides to active
-- ============================================
-- Uncomment the line below to activate ALL slides
-- UPDATE hero_carousel SET is_active = true;

-- ============================================
-- STEP 4: Fix - Reset positions to 1, 2, 3, 4
-- ============================================
-- This ensures proper ordering
-- Uncomment the block below to fix positions:

/*
WITH numbered_slides AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_position
    FROM hero_carousel
)
UPDATE hero_carousel
SET 
    position = numbered_slides.new_position,
    sort_order = numbered_slides.new_position
FROM numbered_slides
WHERE hero_carousel.id = numbered_slides.id;
*/

-- ============================================
-- STEP 5: Delete slides without images (OPTIONAL)
-- ============================================
-- Only run this if you want to remove slides that don't have images
-- Uncomment the line below:
-- DELETE FROM hero_carousel WHERE image_url IS NULL OR image_url = '';

-- ============================================
-- STEP 6: Verify the fixes
-- ============================================
SELECT 
    id,
    title,
    CASE 
        WHEN image_url IS NULL OR image_url = '' THEN '❌ NO IMAGE'
        ELSE '✅ HAS IMAGE'
    END as image_status,
    is_active,
    COALESCE(sort_order, position, 0) as position
FROM hero_carousel
ORDER BY COALESCE(sort_order, position, 0) ASC;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Run STEP 1 and STEP 2 first to see the current state
-- 2. Based on the results:
--    - If slides are inactive: Uncomment STEP 3
--    - If positions are wrong: Uncomment STEP 4
--    - If you want to remove slides without images: Uncomment STEP 5
-- 3. Run STEP 6 to verify everything is fixed
-- ============================================
