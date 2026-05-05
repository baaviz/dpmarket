import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import { Shield, Zap, Smartphone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function HeroSection({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('hero');
  const isAr = locale === 'ar';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  // Fetch the primary active product
  const { data: product } = await supabase
    .from('products')
    .select('slug, price, currency, variants')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single();

  let priceStr = null;
  if (product) {
      const basePrice = product.price;
      const currency = product.currency || 'QAR';
      priceStr = `${basePrice} ${currency === 'SAR' ? (isAr ? 'ر.س' : 'SAR') : (isAr ? 'ر.ق' : 'QAR')}`;
  }

  return (
    <section className="relative overflow-hidden bg-surface-50">
      <Container className="relative">
        <div className="pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="max-w-xl text-center lg:text-start mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-sm text-primary-700 font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>{t('trustInstant')}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold text-surface-900 leading-[1.15] tracking-tight text-balance mb-6">
                {t('title')}
              </h1>
              
              <p className="text-lg md:text-xl text-surface-600 leading-relaxed text-balance mb-10">
                {t('subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] h-14 px-8 text-base font-bold rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 transition-all active:scale-[0.98]"
                >
                  {t('cta')}
                  <ArrowLeft className={`h-5 w-5 ${isAr ? 'rotate-180' : 'rotate-0'}`} />
                </Link>
                <Link
                  href="/apps"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-xl bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 transition-all"
                >
                  {t('ctaSecondary')}
                </Link>
              </div>

              {/* Trust Features */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium text-surface-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-500" />
                  <span>{t('trustEncrypted')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-success" />
                  <span>{t('trustWhatsapp')}</span>
                </div>
              </div>
            </div>

            {/* Featured Product Card Visual */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-primary-200/50 rounded-full blur-3xl transform -translate-x-4 translate-y-4" />
              
              <div className="relative bg-white rounded-3xl border border-surface-100 shadow-2xl p-6 sm:p-8">
                <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-6 flex flex-col justify-between overflow-hidden relative mb-6">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                  <div className="relative flex justify-between items-start">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white">
                        {isAr ? 'دوحة بلس' : 'Doha Plus'}
                    </span>
                    <Shield className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="relative">
                    <h3 className="text-2xl font-bold text-white mb-1">
                        {isAr ? 'كود التفعيل الذهبي' : 'Premium Activation Code'}
                    </h3>
                    <p className="text-primary-100 text-sm">
                        {isAr ? 'وصول كامل لجميع التطبيقات والألعاب المحدثة' : 'Full access to all updated apps and games'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    isAr ? 'تفعيل فوري ووصول مباشر للتطبيقات' : 'Instant activation and direct access',
                    isAr ? 'آلاف التطبيقات والألعاب المحدثة باستمرار' : 'Thousands of continuously updated apps',
                    isAr ? 'بدون جلبريك وبأعلى استقرار' : 'No Jailbreak needed, highest stability',
                    isAr ? 'دعم فني جاهز لخدمتك' : 'Technical support ready to help'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                      <span className="text-surface-700 text-sm font-medium leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-surface-100 flex items-center justify-between">
                  <div>
                    {product ? (
                        <>
                        <p className="text-xs text-surface-500 mb-1">{isAr ? 'السعر' : 'Price'}</p>
                        <p className="text-2xl font-bold text-surface-900">{priceStr}</p>
                        </>
                    ) : (
                        <p className="text-sm font-bold text-primary-600">
                            {isAr ? 'قريباً بتقدر تشتري كود التفعيل مباشرة من هنا' : 'Soon you can buy activation codes right here'}
                        </p>
                    )}
                  </div>
                  <Link
                    href={product ? `/products/${product.slug}` : '/products'}
                    className="inline-flex items-center justify-center h-12 px-6 text-sm font-bold rounded-xl bg-surface-900 text-white hover:bg-surface-800 transition-all active:scale-[0.98]"
                  >
                    {isAr ? 'التفاصيل' : 'Details'}
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
