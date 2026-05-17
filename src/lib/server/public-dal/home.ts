import { getPublicSettingsCached, settingsArrayToMap } from './settings';
import {
    getFeaturedPublicProductCardsCached,
    getPublicProductCardsCached,
} from './products';
import { getFeaturedAppsCached } from './apps';

export async function getHomePageDataCached() {
    // Run all fetches in parallel since they are cached
    const [settings, featuredProducts, products, featuredApps] = await Promise.all([
        getPublicSettingsCached(),
        getFeaturedPublicProductCardsCached(8),
        getPublicProductCardsCached(8),
        getFeaturedAppsCached(),
    ]);

    // Format settings
    const settingsMap = settingsArrayToMap(settings as Array<{ key: string; value: unknown }>);

    return {
        settings: settingsMap,
        featuredProducts,
        products,
        featuredApps,
    };
}
