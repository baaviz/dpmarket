import { HeroSection } from '@/components/marketing/hero-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { AppsShowcaseSection } from '@/components/marketing/apps-showcase-section';
import { ProductsShowcaseSection } from '@/components/marketing/products-showcase-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { CtaBanner } from '@/components/marketing/cta-banner';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <HeroSection locale={locale} />
      <ProductsShowcaseSection locale={locale} />
      <FeaturesSection />
      <AppsShowcaseSection locale={locale} />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
