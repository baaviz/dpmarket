import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft, Key, Download, HardDrive, Hash, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { AppIcon } from '@/components/ui/app-icon';

export const revalidate = 60;

async function fetchAppFallback(slug: string) {
    try {
        const dataPath = path.join(process.cwd(), 'src', 'data', 'doha-apps-snapshot.json');
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf-8');
            const apps = JSON.parse(raw);
            return apps.find((a: any) => a.slug === slug) || null;
        }
    } catch (e) {
        // Ignore fallback errors
    }
    return null;
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  let { data: app } = await supabase
    .from('apps_catalog')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!app) {
      // Layer 2: Fallback to Snapshot
      app = await fetchAppFallback(slug);
  }

  if (!app) {
    notFound();
  }

  const iconSrc = app.icon_storage_path || app.icon_url || app.source_icon_url || null;
  
  // Format features
  let featuresList: string[] = [];
  if (app.features) {
      featuresList = app.features.split('\n').map((f: string) => f.trim().replace(/^-+/, '').trim()).filter(Boolean);
  } else if (app.description) {
      // If we only have description from snapshot, use it
      featuresList = [app.description];
  }

  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-20">
      <Container size="md">
        
        {/* Back Link */}
        <Link href="/apps" className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 mb-8 transition-colors">
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          {isAr ? 'العودة للتطبيقات' : 'Back to Apps'}
        </Link>

        {/* App Header Card */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-surface-200 mb-8">
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                
                <AppIcon 
                    src={iconSrc} 
                    name={app.name} 
                    size="xl" 
                    className="shrink-0 rounded-[2.5rem] shadow-md border border-surface-200/50"
                />
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
                            {app.name}
                        </h1>
                        {app.is_active !== false && (
                            <ShieldCheck className="w-6 h-6 text-success" />
                        )}
                    </div>
                    
                    {app.category && (
                        <span className="inline-block mb-4 px-3 py-1 rounded-lg bg-surface-100 text-surface-600 text-sm font-medium">
                            {app.category}
                        </span>
                    )}

                    <p className="text-surface-500 text-lg mb-6 max-w-2xl">
                        {isAr ? 'تطبيق مميز متاح الآن عبر دوحة بلس.' : 'A premium app available now via Doha Plus.'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Link 
                            href="/checkout"
                            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all active:scale-[0.98] shadow-md shadow-primary-600/20"
                        >
                            <Key className="w-5 h-5" />
                            {isAr ? 'شراء كود تفعيل' : 'Buy Activation Code'}
                        </Link>
                        <a 
                            href="https://api.whatsapp.com/send/?phone=97466937442"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-surface-100 hover:bg-surface-200 text-surface-900 font-bold transition-all"
                        >
                            {isAr ? 'استفسار واتساب' : 'WhatsApp Inquiry'}
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content: Features */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-200">
                    <h2 className="text-xl font-bold text-surface-900 mb-6">
                        {isAr ? 'المميزات' : 'Overview & Features'}
                    </h2>
                    
                    {featuresList.length > 0 ? (
                        <ul className="space-y-4">
                            {featuresList.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-700" />
                                    </div>
                                    <span className="text-surface-700 leading-relaxed">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-surface-500 italic">
                            {isAr ? 'لا توجد تفاصيل إضافية لهذا التطبيق.' : 'No additional details available for this app.'}
                        </p>
                    )}
                </div>
            </div>

            {/* Sidebar: Metadata */}
            <div className="space-y-8">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-200">
                    <h3 className="text-lg font-bold text-surface-900 mb-6">
                        {isAr ? 'المعلومات' : 'Information'}
                    </h3>
                    
                    <dl className="space-y-4">
                        {app.version && (
                            <div className="flex justify-between items-center py-3 border-b border-surface-100 last:border-0">
                                <dt className="flex items-center gap-2 text-surface-500 font-medium">
                                    <Download className="w-4 h-4" />
                                    {isAr ? 'الإصدار' : 'Version'}
                                </dt>
                                <dd className="text-surface-900 font-bold">{app.version}</dd>
                            </div>
                        )}
                        
                        {app.size && (
                            <div className="flex justify-between items-center py-3 border-b border-surface-100 last:border-0">
                                <dt className="flex items-center gap-2 text-surface-500 font-medium">
                                    <HardDrive className="w-4 h-4" />
                                    {isAr ? 'الحجم' : 'Size'}
                                </dt>
                                <dd className="text-surface-900 font-bold">{app.size}</dd>
                            </div>
                        )}

                        {app.bundle_id && (
                            <div className="flex justify-between items-center py-3 border-b border-surface-100 last:border-0">
                                <dt className="flex items-center gap-2 text-surface-500 font-medium">
                                    <Hash className="w-4 h-4" />
                                    {isAr ? 'الحزمة' : 'Bundle ID'}
                                </dt>
                                <dd className="text-surface-900 font-mono text-xs">{app.bundle_id}</dd>
                            </div>
                        )}

                        {app.last_updated_at && (
                            <div className="flex justify-between items-center py-3 border-b border-surface-100 last:border-0">
                                <dt className="flex items-center gap-2 text-surface-500 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {isAr ? 'آخر تحديث' : 'Last Updated'}
                                </dt>
                                <dd className="text-surface-900 font-bold text-sm">
                                    {new Date(app.last_updated_at).toLocaleDateString(locale)}
                                </dd>
                            </div>
                        )}
                        
                        {/* Static default if nothing above is present */}
                        {!app.version && !app.size && !app.bundle_id && !app.last_updated_at && (
                            <div className="flex justify-between items-center py-3 border-b border-surface-100 last:border-0">
                                <dt className="flex items-center gap-2 text-surface-500 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {isAr ? 'الحالة' : 'Status'}
                                </dt>
                                <dd className="text-surface-900 font-bold text-sm">
                                    {isAr ? 'مُحدث' : 'Updated'}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

        </div>
      </Container>
    </div>
  );
}
