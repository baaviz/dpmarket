import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { unstable_cache } from 'next/cache';

export async function getPublicProducts() {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from('products')
        .select(`
            id,
            slug,
            name,
            short_description,
            price,
            currency,
            image_url,
            is_active,
            is_featured,
            sort_order,
            category:product_categories(name)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
        
    return data || [];
}

export const getPublicProductsCached = unstable_cache(
    async () => getPublicProducts(),
    ['public-products'],
    { tags: ['products'], revalidate: 300 } // 5 minutes
);

export async function getProductBySlug(slug: string) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from('products')
        .select(`
            id,
            slug,
            name,
            short_description,
            description,
            price,
            currency,
            image_url,
            purchase_link,
            is_active,
            category:product_categories(name)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
        
    return data;
}

export const getProductBySlugCached = unstable_cache(
    async (slug: string) => getProductBySlug(slug),
    ['product-by-slug'],
    { tags: ['products'], revalidate: 300 } // 5 minutes
);
