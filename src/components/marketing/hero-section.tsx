import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import { Shield, Zap, Smartphone, ArrowLeft, CheckCircle2, UserX } from 'lucide-react';
import type { PublicProductCard } from '@/lib/server/public-dal/products';
import type { PublicSettingsMap } from '@/lib/server/public-dal/settings';
import { formatCurrency, getLocalizedText } from '@/lib/commerce';

export async function HeroSection({
  locale,
  product,
  settings,
}: {
  locale: string;
  product?: PublicProductCard;
  settings?: PublicSettingsMap;
}) {
  setRequestLocale(locale);
  const t = await getTranslations('hero');
  const isAr = locale === 'ar';
  const heroVisual = settings?.brand_media?.homepage_hero_visual;
  const productName = product ? getLocalizedText(product.name, locale, isAr ? 'كود تفعيل دوحة بلس' : 'Doha Plus Activation Code') : null;
  const priceStr = product ? formatCurrency(product.price, product.currency, locale) : null;

  return (
    <section className="relative overflow-hidden bg-[#fbfaf8] border-b border-surface-100">
      <Container className="relative">
        <div className="pt-24 pb-14 md:pt-32 md:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            
            {/* Text Content */}
            <div className="max-w-2xl text-center lg:text-start mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-surface-200 text-sm text-surface-700 font-semibold mb-6 shadow-sm">
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
              <div className="mt-10 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-3 text-sm font-semibold text-surface-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-500" />
                  <span>{t('trustEncrypted')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-success" />
                  <span>{t('trustWhatsapp')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-surface-500" />
                  <span>{isAr ? 'بدون حساب' : 'No account'}</span>
                </div>
              </div>
            </div>

            {/* Featured Product Card Visual */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative bg-white rounded-2xl border border-surface-200 shadow-xl shadow-surface-900/5 p-5 sm:p-6">
                <div className="aspect-video w-full rounded-xl bg-surface-950 p-6 flex flex-col justify-between overflow-hidden relative mb-6">
                  {heroVisual && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={heroVisual} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                  )}
                  <div className="relative flex justify-between items-start">
                    <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium text-white">
                        {isAr ? 'دوحة بلس' : 'Doha Plus'}
                    </span>
                    <Shield className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="relative">
                    <h3 className="text-2xl font-bold text-white mb-1">
                        {productName || (isAr ? 'كود تفعيل دوحة بلس' : 'Doha Plus Activation Code')}
                    </h3>
                    <p className="text-primary-100 text-sm">
                        {isAr ? 'ادفع بأمان واستلم كودك مباشرة' : 'Pay securely and receive your code instantly'}
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
                    href={product ? `/p/${product.slug}` : '/products'}
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
