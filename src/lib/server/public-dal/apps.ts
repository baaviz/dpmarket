import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { unstable_cache } from 'next/cache';

export type PublicAppSummary = {
    slug: string;
    name: string;
    category: string | null;
    short_description?: string | null;
    description?: string | null;
    icon_storage_path?: string | null;
    icon_url?: string | null;
    source_icon_url?: string | null;
    is_active?: boolean;
    is_featured?: boolean;
    last_updated_at?: string | null;
    sort_order?: number | null;
    requires_code?: boolean | null;
};

export type PublicAppDetail = PublicAppSummary & {
    banner_url?: string | null;
    source_url?: string | null;
    source_provider?: string | null;
    external_id?: string | null;
    bundle_id?: string | null;
    version?: string | null;
    size?: string | null;
    features?: string | null;
    metadata?: Record<string, unknown> | null;
};

export async function getFeaturedApps(): Promise<PublicAppSummary[]> {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from('apps_catalog')
        .select(`
            slug,
            name,
            category,
            icon_storage_path,
            icon_url,
            source_icon_url,
            is_active,
            is_featured,
            last_updated_at,
            sort_order
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: false })
        .limit(12);
        
    return (data || []) as PublicAppSummary[];
}

export const getFeaturedAppsCached = unstable_cache(
    async () => getFeaturedApps(),
    ['featured-apps'],
    { tags: ['apps'], revalidate: 1800 } // 30 minutes
);

export async function getAppsCategories(): Promise<string[]> {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from('apps_catalog')
        .select('category')
        .eq('is_active', true);
        
    if (!data) return [];
    
    return Array.from(new Set(data.map(c => c.category).filter(Boolean)));
}

export const getAppsCategoriesCached = unstable_cache(
    async () => getAppsCategories(),
    ['apps-categories'],
    { tags: ['apps'], revalidate: 3600 } // 1 hour
);

export async function getAppBySlug(slug: string): Promise<PublicAppDetail | null> {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from('apps_catalog')
        .select('*') // Detail page needs all info
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
        
    return data as PublicAppDetail | null;
}

export const getAppBySlugCached = unstable_cache(
    async (slug: string) => getAppBySlug(slug),
    ['app-by-slug'],
    { tags: ['apps'], revalidate: 1800 } // 30 minutes
);

export async function getApps(q?: string, category?: string, page: number = 1, limit: number = 24): Promise<{
    apps: PublicAppSummary[];
    totalCount: number;
}> {
    const supabase = createSupabaseAdminClient();
    const offset = (page - 1) * limit;
    
    let query = supabase
        .from('apps_catalog')
        .select(`
            slug,
            name,
            category,
            short_description,
            icon_storage_path,
            icon_url,
            source_icon_url,
            is_active,
            is_featured,
            last_updated_at,
            sort_order
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('sort_order', { ascending: false })
        .order('last_updated_at', { ascending: false, nullsFirst: false });

    if (q) {
        // Use full-text search if query is provided (requires the index from migration)
        query = query.ilike('name', `%${q}%`);
    }
    if (category && category !== 'all') {
        query = query.eq('category', category);
    }

    const { data, count } = await query.range(offset, offset + limit - 1);
    
    return { apps: (data || []) as PublicAppSummary[], totalCount: count || 0 };
}

export const getCachedApps = unstable_cache(
    async (q?: string, category?: string, page: number = 1, limit: number = 24) => getApps(q, category, page, limit),
    ['apps-list-paginated'],
    { tags: ['apps'], revalidate: 600 } // 10 minutes
);
