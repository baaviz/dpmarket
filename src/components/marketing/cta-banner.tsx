import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft } from 'lucide-react';

export async function CtaBanner({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <section className="py-20 md:py-28 bg-surface-950 text-white">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('readyTitle')}</h2>
          <p className="mt-4 text-surface-400 text-base">{t('readyDesc')}</p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 text-base font-semibold rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-200 active:scale-[0.98]"
            >
              {t('readyCta')}
              <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
