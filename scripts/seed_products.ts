
import { createClient } from '@supabase/supabase-js';
// dotenv removed, relying on shell environment


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    { name: 'Dresses', slug: 'dresses', name_ar: 'فساتين' },
    { name: 'Tops', slug: 'tops', name_ar: 'بلايز' },
    { name: 'Bottoms', slug: 'bottoms', name_ar: 'بناطيل' },
    { name: 'Outerwear', slug: 'outerwear', name_ar: 'ملابس خارجية' },
    { name: 'Accessories', slug: 'accessories', name_ar: 'اكسسوارات' },
    { name: 'Face Care', slug: 'face_care', name_ar: 'العناية بالوجه' },
    { name: 'Hair Care', slug: 'hair_care', name_ar: 'العناية بالشعر' },
    { name: 'Body Care', slug: 'body_care', name_ar: 'العناية بالجسم' },
    { name: 'Gift Sets', slug: 'gift_sets', name_ar: 'مجموعات الهدايا' },
];

const mockImages = [
    '/products/mock-dress-1.png',
    '/products/mock-blouse-1.png',
];

const adjectives = ['Luxury', 'Elegant', 'Soft', 'Nano Banana', 'Premium', 'Classic', 'Modern', 'Chic'];
const materials = ['Silk', 'Cotton', 'Linen', 'Wool', 'Velvet', 'Satin', 'Real Cloth'];

function getRandomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPrice(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
    console.log('Starting seed...');

    // 1. Upsert Categories
    console.log('Upserting categories...');
    for (const cat of categories) {
        const { error } = await supabase
            .from('categories')
            .upsert({
                name: cat.name,
                slug: cat.slug,
                name_ar: cat.name_ar,
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (error) {
            console.error(`Errorupserting category ${cat.name}:`, error.message);
        }
    }

    // 2. Generate Products
    const products = [];
    for (const cat of categories) {
        for (let i = 0; i < 5; i++) {
            const isDress = cat.slug === 'dresses' || Math.random() > 0.5;
            const image = isDress ? mockImages[0] : mockImages[1];
            const adj = getRandomItem(adjectives);
            const mat = getRandomItem(materials);

            const title = `${adj} ${mat} ${cat.name.slice(0, -1)} - Nano Banana Edition`;
            const title_ar = `${cat.name_ar} ${adj} ${mat} - إصدار نانو بنانا`; // Rough translation

            products.push({
                title,
                title_ar: title_ar,
                description: `Experience the ultimate comfort with our ${title}. Made from authentic ${mat}, this piece from the Nano Banana Real Cloth collection is designed for the modern woman.`,
                description_ar: `استمتعي بالراحة القصوى مع ${title_ar}. مصنوعة من ${mat} الأصلي، هذه القطعة من مجموعة نانو بنانا ريـال كلوث مصممة للمرأة العصرية.`,
                sku: `NB-${cat.slug.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
                category: cat.slug,
                price: getRandomPrice(300, 1500),
                compare_at_price: Math.random() > 0.7 ? getRandomPrice(1600, 2500) : null,
                stock: getRandomPrice(10, 100),
                status: 'active',
                images: [image, image], // Duplicate image for carousel effect
                sales_count: getRandomPrice(0, 50),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    }

    // 3. Insert Products
    console.log(`Inserting ${products.length} products...`);
    const { error } = await supabase.from('products').insert(products);

    if (error) {
        console.error('Error inserting products:', error);
    } else {
        console.log('Successfully inserted products!');
    }
}

seed();
