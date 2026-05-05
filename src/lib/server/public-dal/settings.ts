import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { unstable_cache } from 'next/cache';

export async function getPublicSettings() {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from('settings')
        .select('key, value')
        .eq('is_public', true);
        
    return data || [];
}

export const getPublicSettingsCached = unstable_cache(
    async () => getPublicSettings(),
    ['public-settings'],
    { tags: ['settings'], revalidate: 300 } // 5 minutes
);
