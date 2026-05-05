'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';
import { Package, ArrowLeft } from 'lucide-react';

export function FeaturedProductsSection() {
  const t = useTranslations('home');
  const tProducts = useTranslations('products');

  const products: unknown[] = [];

  return (
    <Section>
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900">
              {t('featuredProducts')}
            </h2>
            <p className="mt-2 text-lg text-surface-500">{t('featuredProductsDesc')}</p>
          </div>
          <Link href="/products">
            <Button variant="secondary" className="group shrink-0">
              {tProducts('title')}
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:rotate-0 ltr:rotate-180 ltr:group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-surface-200 bg-gradient-to-br from-surface-50 to-white p-12 sm:p-16">
            <div className="absolute top-0 end-0 h-40 w-40 rounded-full bg-primary-50/50 blur-3xl" />
            <EmptyState
              icon={<Package className="h-14 w-14" />}
              title={t('noProducts')}
              description={t('noProductsDesc')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ProductCard components will be rendered here when products exist */}
          </div>
        )}
      </Container>
    </Section>
  );
}
