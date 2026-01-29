
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const mockCarouselItems = [
    {
        title: 'The Secret of Moroccan Beauty',
        subtitle: 'Pure • Natural • Timeless',
        image_url: '/hero-showcase-1.jpg',
        link: '/collections/beauty',
        sort_order: 1,
        is_active: true
    },
    {
        title: 'Handcrafted Excellence',
        subtitle: 'From Morocco with Love',
        image_url: '/hero-showcase-2.jpg',
        link: '/collections/handcrafted',
        sort_order: 2,
        is_active: true
    },
    {
        title: 'Liquid Gold',
        subtitle: 'Cold Pressed Argan Oil',
        image_url: '/hero-showcase-3.jpg',
        link: '/products/argan-oil',
        sort_order: 3,
        is_active: true
    },
    {
        title: 'Natural Radiance',
        subtitle: '100% Organic • Certified',
        image_url: '/hero-showcase-4.jpg',
        link: '/collections/organic',
        sort_order: 4,
        is_active: true
    },
    {
        title: 'Beauty Ritual',
        subtitle: 'Ancient Wisdom • Modern Care',
        image_url: '/hero-showcase-5.jpg',
        link: '/collections/rituals',
        sort_order: 5,
        is_active: true
    },
    {
        title: 'Diar Argan',
        subtitle: 'Authentic Moroccan Skincare',
        image_url: '/hero-showcase-6.jpg',
        link: '/about',
        sort_order: 6,
        is_active: true
    }
];

async function seed() {
    console.log('Starting hero carousel seed...');

    const { error: deleteError } = await supabase
        .from('hero_carousel')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows safely

    if (deleteError) {
        console.warn('Error clearing table (might be empty or RLS restricted):', deleteError.message);
    } else {
        console.log('Cleared existing carousel items.');
    }

    console.log(`Inserting ${mockCarouselItems.length} items...`);
    const { data, error } = await supabase
        .from('hero_carousel')
        .insert(mockCarouselItems)
        .select();

    if (error) {
        console.error('Error inserting items:', error);
    } else {
        console.log('Successfully inserted items:', data?.length);
    }
}

seed();
