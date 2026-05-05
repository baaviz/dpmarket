import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import { XCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function PaymentFailedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('payment');

  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-20">
      <Container size="sm">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-surface-200 overflow-hidden">
          
          {/* Header Area */}
          <div className="bg-error/5 border-b border-error/10 px-8 py-10 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="relative flex items-center justify-center w-full h-full bg-error text-white rounded-full shadow-lg shadow-error/30">
                <XCircle className="w-10 h-10" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-surface-900 mb-2">
              {t('failedTitle')}
            </h1>
            <p className="text-surface-600 max-w-sm mx-auto">
              {t('failedDesc')}
            </p>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 text-center mb-10">
              <p className="text-surface-700 font-medium mb-2">
                {isAr ? 'لا تقلق، ما تم خصم أي مبلغ.' : 'Don\'t worry, no amount was deducted.'}
              </p>
              <p className="text-sm text-surface-500">
                {isAr ? 'تقدر تجرب طريقة دفع ثانية أو تتأكد من معلومات البطاقة.' : 'You can try another payment method or check your card details.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all active:scale-[0.98] shadow-md shadow-primary-600/20"
              >
                <RefreshCw className="w-5 h-5" />
                {t('tryAgain')}
              </Link>
              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-white border border-surface-200 text-surface-900 font-bold hover:bg-surface-50 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 text-success" />
                {t('contactSupport')}
              </a>
            </div>
            
          </div>
        </div>
      </Container>
    </div>
  );
}
