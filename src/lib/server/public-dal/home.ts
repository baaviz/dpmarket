import { getPublicSettingsCached } from './settings';
import { getPublicProductsCached } from './products';
import { getFeaturedAppsCached } from './apps';

export async function getHomePageDataCached() {
    // Run all fetches in parallel since they are cached
    const [settings, products, featuredApps] = await Promise.all([
        getPublicSettingsCached(),
        getPublicProductsCached(),
        getFeaturedAppsCached(),
    ]);

    // Format settings
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, any>);

    return {
        settings: settingsMap,
        featuredProducts: products.filter(p => p.is_featured).slice(0, 8),
        products: products.slice(0, 8), // Provide fallback if no featured
        featuredApps,
    };
}
