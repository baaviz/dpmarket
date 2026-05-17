import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { unstable_cache } from 'next/cache';
import type { BilingualText } from '@/types';

export type PublicProductCategory = {
    name: BilingualText | string | null;
};

export type PublicProductListItem = {
    id: string;
    slug: string;
    name: BilingualText | string;
    short_description: BilingualText | string | null;
    price: number | string;
    currency: string | null;
    image_url: string | null;
    is_active?: boolean;
    is_featured?: boolean;
    sort_order?: number | null;
    category?: PublicProductCategory | PublicProductCategory[] | null;
};

export type PublicProductCard = Omit<PublicProductListItem, 'category' | 'is_active'>;

export type PublicProductDetail = PublicProductListItem & {
    description: BilingualText | string | null;
    purchase_link: string | null;
};

export async function getPublicProducts(q?: string): Promise<PublicProductListItem[]> {
    const supabase = createSupabaseAdminClient();
    let query = supabase
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

    if (q) {
        query = query.or(`slug.ilike.%${q}%,name->>ar.ilike.%${q}%,name->>en.ilike.%${q}%`);
    }

    const { data } = await query;
        
    return (data || []) as PublicProductListItem[];
}

export const getPublicProductsCached = unstable_cache(
    async () => getPublicProducts(),
    ['public-products'],
    { tags: ['products'], revalidate: 300 } // 5 minutes
);

export const getPublicProductsSearchCached = unstable_cache(
    async (q?: string) => getPublicProducts(q),
    ['public-products-search'],
    { tags: ['products'], revalidate: 300 }
);

function getPublicProductCardsQuery() {
    const supabase = createSupabaseAdminClient();

    return supabase
        .from('products')
        .select(`
            id,
            slug,
            name,
            short_description,
            price,
            currency,
            image_url,
            is_featured,
            sort_order
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
}

export async function getFeaturedPublicProductCards(limit: number = 8): Promise<PublicProductCard[]> {
    const { data } = await getPublicProductCardsQuery()
        .eq('is_featured', true)
        .limit(limit);

    return (data || []) as PublicProductCard[];
}

export const getFeaturedPublicProductCardsCached = unstable_cache(
    async (limit: number = 8) => getFeaturedPublicProductCards(limit),
    ['featured-product-cards'],
    { tags: ['products'], revalidate: 300 }
);

export async function getPublicProductCards(limit: number = 8): Promise<PublicProductCard[]> {
    const { data } = await getPublicProductCardsQuery().limit(limit);

    return (data || []) as PublicProductCard[];
}

export const getPublicProductCardsCached = unstable_cache(
    async (limit: number = 8) => getPublicProductCards(limit),
    ['public-product-cards'],
    { tags: ['products'], revalidate: 300 }
);

export async function getProductBySlug(slug: string): Promise<PublicProductDetail | null> {
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
        
    return data as PublicProductDetail | null;
}

export const getProductBySlugCached = unstable_cache(
    async (slug: string) => getProductBySlug(slug),
    ['product-by-slug'],
    { tags: ['products'], revalidate: 300 } // 5 minutes
);
