import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft, Key } from 'lucide-react';
import { AppIcon } from '@/components/ui/app-icon';
import type { PublicAppSummary } from '@/lib/server/public-dal/apps';
import type { PublicSettingsMap } from '@/lib/server/public-dal/settings';

export async function AppsShowcaseSection({
  locale,
  apps,
}: {
  locale: string;
  apps: PublicAppSummary[];
  settings?: PublicSettingsMap;
}) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const featuredApps = apps.slice(0, 8);

  if (featuredApps.length === 0) return null;

  return (
    <Section className="bg-surface-50 py-24 border-y border-surface-200/50">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
              {isAr ? 'تطبيقات مختارة لك' : 'Handpicked Apps for You'}
            </h2>
            <p className="text-lg text-surface-600 leading-relaxed">
              {isAr 
                ? 'استكشف مكتبتنا الضخمة من التطبيقات الحصرية والمعدلة، حملها الآن واستمتع بمميزات لا حصر لها.' 
                : 'Explore our massive library of exclusive and tweaked apps. Download now and enjoy unlimited features.'}
            </p>
          </div>
          <Link 
            href="/apps" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold group whitespace-nowrap"
          >
            {isAr ? 'عرض كل التطبيقات' : 'View All Apps'}
            <ArrowLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${!isAr && 'rotate-180 group-hover:translate-x-1'}`} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredApps.map((app) => (
                <Link key={app.slug} href={`/apps/${app.slug}`} className="group block h-full">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-surface-200 hover:shadow-xl hover:border-primary-200 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                    <AppIcon
                      sources={[app.icon_storage_path, app.icon_url, app.source_icon_url]}
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
                    {app.short_description || app.description || (isAr ? 'تطبيق محدث ضمن مكتبة دوحة بلس.' : 'Updated app in the Doha Plus catalog.')}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                    <span className="text-xs text-surface-400 font-medium">
                        {isAr ? 'متوفر الآن' : 'Available'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <Key className="w-3.5 h-3.5" />
                        {isAr ? 'يحتاج كود' : 'Code Req'}
                    </span>
                    </div>
                </div>
                </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
