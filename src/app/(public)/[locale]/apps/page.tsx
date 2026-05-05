import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import { Key, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import fs from 'fs';
import path from 'path';
import { AppIcon } from '@/components/ui/app-icon';
import { getCachedApps, getAppsCategoriesCached } from '@/lib/server/public-dal/apps';

// Revalidate every 10 minutes
export const revalidate = 600;

async function fetchAppsFallback() {
    try {
        const dataPath = path.join(process.cwd(), 'src', 'data', 'doha-apps-snapshot.json');
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        // Ignore fallback errors
    }
    return [];
}

export default async function AppsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { q, category, page } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('apps');
  const isAr = locale === 'ar';

  const currentPage = parseInt(page || '1', 10);
  const limit = 24;

  // Layer 1: Cached DB Fetch
  let { apps, totalCount } = await getCachedApps(q, category, currentPage, limit);
  let uniqueCategories = await getAppsCategoriesCached();

  // Layer 2: Fallback to Snapshot if DB is totally empty
  if (totalCount === 0 && (!q && (!category || category === 'all'))) {
      const fallbackApps = await fetchAppsFallback();
      if (fallbackApps && fallbackApps.length > 0) {
          const offset = (currentPage - 1) * limit;
          apps = fallbackApps.slice(offset, offset + limit);
          totalCount = fallbackApps.length;
          uniqueCategories = Array.from(new Set(fallbackApps.map((a: any) => a.category).filter(Boolean)));
      }
  } else if (totalCount === 0 && (q || category)) {
      const fallbackApps = await fetchAppsFallback();
      if (fallbackApps && fallbackApps.length > 0) {
          uniqueCategories = Array.from(new Set(fallbackApps.map((a: any) => a.category).filter(Boolean)));
          let filtered = fallbackApps;
          if (q) {
              filtered = filtered.filter((a: any) => a.name.toLowerCase().includes(q.toLowerCase()));
          }
          if (category && category !== 'all') {
              filtered = filtered.filter((a: any) => a.category === category);
          }
          const offset = (currentPage - 1) * limit;
          apps = filtered.slice(offset, offset + limit);
          totalCount = filtered.length;
      }
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-20">
      <Container>
        <div className="flex flex-col gap-10">
          
          <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold tracking-tight text-surface-900 mb-4">
                {t('title')}
              </h1>
              <p className="text-surface-600">
                {t('subtitle')}
              </p>
            </div>
            
            <form className="relative w-full md:w-80">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <Search className="w-5 h-5 text-surface-400" />
              </div>
              <input 
                type="search" 
                name="q"
                defaultValue={q}
                className="block w-full p-4 ps-12 text-sm text-surface-900 border border-surface-200 rounded-2xl bg-white focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all" 
                placeholder={t('searchPlaceholder')}
              />
              {category && <input type="hidden" name="category" value={category} />}
            </form>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <Link 
              href={`/apps${q ? `?q=${q}` : ''}`}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all ${!category || category === 'all' ? 'bg-surface-900 text-white shadow-md' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'}`}
            >
              {t('all')}
            </Link>
            {uniqueCategories.map(cat => (
              <Link 
                key={cat}
                href={`/apps?category=${encodeURIComponent(cat)}${q ? `&q=${q}` : ''}`}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-surface-900 text-white shadow-md' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'}`}
              >
                {cat}
              </Link>
            ))}
          </div>

          {apps && apps.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {apps.map((app) => {
                  const iconSrc = app.icon_storage_path || app.icon_url || app.source_icon_url || null;
                  return (
                    <Link key={app.slug} href={`/apps/${app.slug}`} className="group block h-full">
                      <div className="bg-white rounded-3xl p-5 shadow-sm border border-surface-200 hover:shadow-xl hover:border-primary-200 transition-all duration-300 h-full flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                          
                          <AppIcon 
                              src={iconSrc} 
                              name={app.name} 
                              size="md" 
                              className="group-hover:scale-105 transition-transform duration-300"
                          />

                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-bold text-surface-900 truncate mb-1" title={app.name}>
                              {app.name}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-surface-100 text-surface-600">
                              {app.category || (isAr ? 'تطبيق' : 'App')}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-surface-500 line-clamp-2 mb-4 flex-grow">
                          {app.short_description || (isAr ? 'اكتشف المزيد حول هذا التطبيق في صفحة التفاصيل.' : 'Discover more about this app on the details page.')}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                          <span className="text-xs text-surface-400 font-medium">
                            {t('updated')} {new Date(app.last_updated_at).toLocaleDateString(isAr ? 'ar-KW' : 'en-US')}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <Key className="w-3.5 h-3.5" />
                            {t('requiresCode')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                        // Only show pages around current page to avoid huge lists
                        if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
                            return (
                                <Link 
                                    key={p} 
                                    href={`/apps?page=${p}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}`}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all ${currentPage === p ? 'bg-surface-900 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                                >
                                    {p}
                                </Link>
                            )
                        } else if (p === currentPage - 3 || p === currentPage + 3) {
                            return <span key={p} className="text-surface-400">...</span>
                        }
                        return null;
                    })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-surface-200 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 text-surface-400 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">{t('emptyTitle')}</h3>
              <p className="text-surface-500 max-w-sm mx-auto">
                {t('emptyDescription')}
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
