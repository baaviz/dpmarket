import { useTranslations } from 'next-intl';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/constants';
import type { PublicSettingsMap } from '@/lib/server/public-dal/settings';
import { SUPPORT_WHATSAPP_URL } from '@/lib/commerce';

export function Footer({ locale, settings }: { locale: Locale; settings?: PublicSettingsMap }) {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();
  const isAr = locale === 'ar';
  const storeInfo = settings?.store_info;
  const media = settings?.brand_media;
  const supportUrl = storeInfo?.contact_whatsapp
    ? `https://api.whatsapp.com/send/?phone=${storeInfo.contact_whatsapp.replace(/[^\d]/g, '')}`
    : SUPPORT_WHATSAPP_URL;

  return (
    <footer className="border-t border-surface-100 bg-white">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {media?.footer_brand_mark ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={media.footer_brand_mark} alt="Doha Plus" className="h-7 w-7 rounded-md object-contain" />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-surface-950 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">D+</span>
                  </div>
                )}
                <span className="font-bold text-base">{isAr ? (storeInfo?.name_ar || 'دوحة بلس') : (storeInfo?.name_en || 'Doha Plus')}</span>
              </div>
              <p className="text-sm text-surface-500 leading-relaxed max-w-xs">{t('description')}</p>
            </div>

            {/* Links */}
            <div className="flex gap-12">
              <div>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Navigation</h4>
                <ul className="space-y-2">
                  <li><Link href="/products" className="text-sm text-surface-600 hover:text-surface-900 transition-colors">{isAr ? 'المنتجات' : 'Products'}</Link></li>
                  <li><Link href="/apps" className="text-sm text-surface-600 hover:text-surface-900 transition-colors">{isAr ? 'التطبيقات' : 'Apps'}</Link></li>
                  <li><Link href="/orders" className="text-sm text-surface-600 hover:text-surface-900 transition-colors">{isAr ? 'طلباتي' : 'My Orders'}</Link></li>
                  <li><a href={supportUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-surface-600 hover:text-surface-900 transition-colors">{isAr ? 'الدعم عبر واتساب' : 'WhatsApp Support'}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><span className="text-sm text-surface-600">{t('privacy')}</span></li>
                  <li><span className="text-sm text-surface-600">{t('terms')}</span></li>
                </ul>
              </div>
            </div>

            {/* Payment methods */}
            <div>
              <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">{isAr ? 'الدفع والأمان' : 'Payment & Security'}</h4>
              <div className="flex flex-wrap gap-2">
                {['Visa', 'Mastercard', 'Apple Pay', isAr ? 'دفع آمن' : 'Secure checkout'].map((method) => (
                  <span key={method} className="px-2.5 py-1 rounded-md bg-surface-50 border border-surface-100 text-xs text-surface-600 font-medium">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-surface-100 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-400">
            © {year} Doha Plus. {t('rights')}.
          </p>
          <p className="text-xs text-surface-400">
            {isAr ? 'دفع آمن واستلام مباشر' : 'Secure payment and instant delivery'}
          </p>
        </div>
      </Container>
    </footer>
  );
}
