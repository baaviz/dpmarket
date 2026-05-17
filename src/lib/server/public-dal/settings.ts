import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { unstable_cache } from 'next/cache';

export type BrandMediaSlot =
    | 'logo_light'
    | 'logo_dark'
    | 'favicon'
    | 'og_image'
    | 'homepage_hero_visual'
    | 'homepage_main_banner'
    | 'homepage_secondary_banner'
    | 'homepage_promo_banner'
    | 'apps_page_banner'
    | 'apps_section_visual'
    | 'product_placeholder'
    | 'app_icon_placeholder'
    | 'footer_brand_mark';

export type BrandMediaSettings = Partial<Record<BrandMediaSlot, string | null>>;

export type StoreInfoSettings = {
    name?: string;
    name_ar?: string;
    name_en?: string;
    description?: string;
    description_ar?: string;
    description_en?: string;
    contact_email?: string;
    contact_whatsapp?: string;
};

export type PublicSettingsMap = {
    store_info?: StoreInfoSettings;
    branding?: Record<string, unknown>;
    brand_media?: BrandMediaSettings;
    social_links?: Record<string, string | null>;
    homepage_faq?: Array<{ q_ar?: string; a_ar?: string; q_en?: string; a_en?: string }>;
    [key: string]: unknown;
};

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

export function settingsArrayToMap(settings: Array<{ key: string; value: unknown }>): PublicSettingsMap {
    return Object.fromEntries(settings.map((s) => [s.key, s.value])) as PublicSettingsMap;
}

export async function getPublicSettingsMapCached() {
    return settingsArrayToMap(await getPublicSettingsCached());
}
