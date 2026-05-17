'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Container } from '@/components/layout/container';
import { Shield, Smartphone, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { formatCurrency, getLocalizedText } from '@/lib/commerce';
import type { BilingualText } from '@/types';

interface Product {
    slug: string;
    name?: BilingualText | string;
    price: number;
    currency: string;
}

export function CheckoutForm({ product }: { product: Product }) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currencyStr = product.currency || 'QAR';
  const priceStr = formatCurrency(product.price, currencyStr, locale);
  const productName = getLocalizedText(product.name, locale, isAr ? 'كود تفعيل دوحة بلس' : 'Doha Plus Activation Code');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!mobile || mobile.length < 8) {
      setError(t('invalidMobile'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: product.slug, mobile, locale }),
      });
      const data = await response.json() as { payment_url?: string; error?: string };

      if (!response.ok || !data.payment_url) {
        setError(data.error || (isAr ? 'تعذر بدء الدفع. حاول مرة ثانية.' : 'Could not start payment. Try again.'));
        return;
      }

      window.location.href = data.payment_url;
    } catch {
      setError(isAr ? 'تعذر الاتصال بصفحة الدفع. حاول مرة ثانية.' : 'Could not connect to payment. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 pt-20 pb-24 md:pb-16">
      <Container size="sm">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight mb-2">
              {t('title')}
            </h1>
            <p className="text-surface-500">
              {isAr ? 'خطوة واحدة وتستلم كودك مباشرة' : 'One step and you receive your code instantly'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-4">{t('summary')}</h2>
              
              <div className="flex items-start justify-between pb-4 border-b border-surface-100">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-900 to-primary-700 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-8 h-8 text-white/80" />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900">
                        {(() => {
                            return productName;
                        })()}
                    </h3>
                    <p className="text-sm text-surface-500 mt-1">{isAr ? 'وصول كامل لجميع التطبيقات' : 'Full access to all apps'}</p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-bold text-surface-900">{priceStr}</p>
                  <p className="text-xs text-surface-400 mt-1">{isAr ? 'الكمية:' : 'Qty:'} 1</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex justify-between text-surface-600 text-sm">
                  <span>{t('subtotal')}</span>
                  <span>{priceStr}</span>
                </div>
                <div className="flex justify-between text-surface-900 font-extrabold text-lg pt-3 border-t border-surface-100">
                  <span>{t('total')}</span>
                  <span>{priceStr}</span>
                </div>
              </div>
            </div>

            {/* Mobile Number Card */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
              <label htmlFor="mobile" className="block text-sm font-bold text-surface-900 mb-2">
                {t('mobileLabel')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                  <Smartphone className="w-5 h-5 text-surface-400" />
                </div>
                <div className="absolute inset-y-0 end-0 flex items-center pe-4 border-s border-surface-200 ps-4 text-surface-500 font-medium" dir="ltr">
                  +974
                </div>
                <input
                  type="tel"
                  id="mobile"
                  dir="ltr"
                  placeholder="33XXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full ps-12 pe-20 py-3.5 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-lg text-surface-900 placeholder:text-surface-400"
                  required
                />
              </div>
              {error && <p className="text-error text-sm mt-2">{error}</p>}
              <p className="text-xs text-surface-500 mt-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-success" />
                {t('mobileHelp')}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">{isAr ? 'الدفع آمن ومحمي بالكامل' : 'Secure Payment'}</p>
                <p className="text-xs text-emerald-600/80 mt-0.5">{isAr ? 'الكود يظهر لك فوراً بعد نجاح الدفع' : 'Code shown instantly after payment'}</p>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('redirecting')}</span>
                  </>
                ) : (
                  <>
                    <span>{isAr ? 'الدفع الإلكتروني' : 'Online Payment'}</span>
                    <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-0' : 'rotate-180'}`} />
                  </>
                )}
              </button>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-surface-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 h-14 bg-primary-600 active:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-600/20 transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isAr ? 'الدفع الإلكتروني - ' : 'Pay - '}{priceStr}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </Container>
    </div>
  );
}
