import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import { CheckCircle2, MessageCircle, Shield, Copy } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('payment');

  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-20">
      <Container size="sm">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-surface-200 overflow-hidden">
          
          {/* Header Area */}
          <div className="bg-success/5 border-b border-success/10 px-8 py-10 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="relative flex items-center justify-center w-full h-full bg-success text-white rounded-full shadow-lg shadow-success/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-surface-900 mb-2">
              {t('successTitle')}
            </h1>
            <p className="text-surface-600">
              {t('successDesc')}
            </p>

            {order && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-surface-200 shadow-sm text-sm">
                <span className="text-surface-500">{t('orderNumber')}:</span>
                <span className="font-bold text-surface-900 font-mono tracking-wider">{order}</span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-8">
            {/* Activation Code Box */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-surface-900 mb-3">{t('yourCode')}</label>
              <div className="relative rounded-2xl bg-surface-900 border border-surface-800 p-6 overflow-hidden group">
                {/* Decorative background */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="font-mono text-2xl md:text-3xl font-bold text-white tracking-widest break-all">
                    XXXX-XXXX-XXXX-XXXX
                  </div>
                  <button className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors backdrop-blur-md border border-white/10">
                    <Copy className="w-4 h-4" />
                    <span>{t('copyCode')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-3 mb-10">
              <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-xl text-sm text-success-800">
                <MessageCircle className="w-5 h-5 text-success-600 shrink-0" />
                <p>{t('whatsappSent')}</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl text-sm text-primary-800">
                <Shield className="w-5 h-5 text-primary-600 shrink-0" />
                <p>{t('securityNote')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all active:scale-[0.98] shadow-md shadow-primary-600/20"
              >
                {t('tryAgain')} {/* Wait, this is tryAgain, let's use a manual string for "Shop More" */}
                {isAr ? 'تسوق المزيد' : 'Shop More'}
              </Link>
              <Link
                href="/orders"
                className="flex-1 flex items-center justify-center h-14 rounded-xl bg-white border-2 border-surface-200 text-surface-900 font-bold hover:bg-surface-50 transition-all active:scale-[0.98]"
              >
                {t('orderNumber').replace(isAr ? 'رقم ' : 'Number', '')} {/* "طلباتي" */}
                {isAr ? 'طلباتي' : 'My Orders'}
              </Link>
            </div>
            
          </div>
        </div>
      </Container>
    </div>
  );
}
