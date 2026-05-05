import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { EmptyState } from '@/components/ui/empty-state';
import { ShoppingCart, Package, Phone, AlertCircle } from 'lucide-react';

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <OrdersHero locale={locale} />
      <Section>
        <Container size="md">
          <OrdersContent />
        </Container>
      </Section>
    </>
  );
}

function OrdersHero({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50/30">
      <div className="absolute top-0 end-0 h-48 w-48 rounded-full bg-primary-100/40 blur-[80px]" />
      <Container className="relative">
        <div className="py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-5">
            <Package className="h-4 w-4" />
            {isAr ? 'طلباتي' : 'My Orders'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-surface-900">
            {isAr ? 'تتبع طلباتك' : 'Track Your Orders'}
          </h1>
          <p className="mt-4 text-lg text-surface-500 max-w-xl mx-auto">
            {isAr ? 'عرض جميع طلباتك وأكواد التفعيل' : 'View all your orders and activation codes'}
          </p>
        </div>
      </Container>
    </section>
  );
}

function OrdersContent() {
  const t = useTranslations('orders');

  return (
    <div className="space-y-8">
      {/* Empty State */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-surface-200 bg-gradient-to-br from-surface-50 to-white p-12 sm:p-16">
        <div className="absolute top-0 end-0 h-40 w-40 rounded-full bg-primary-50/60 blur-3xl" />
        <EmptyState
          icon={<ShoppingCart className="h-16 w-16" />}
          title={t('noOrders')}
          description={t('noOrdersDesc')}
        />
      </div>

      {/* Phone Recovery */}
      <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-100 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">{t('recoverByPhone')}</h2>
            <p className="text-sm text-surface-500">{t('recoverDesc')}</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200/60 p-4">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700">{t('recoverNotConfigured')}</p>
              <p className="text-sm text-amber-600 mt-1">{t('recoverNotConfiguredDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
