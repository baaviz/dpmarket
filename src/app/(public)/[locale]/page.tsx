import { HeroSection } from '@/components/marketing/hero-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { AppsShowcaseSection } from '@/components/marketing/apps-showcase-section';
import { ProductsShowcaseSection } from '@/components/marketing/products-showcase-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { CtaBanner } from '@/components/marketing/cta-banner';

// Revalidate every 30 seconds — near-realtime without killing performance
export const revalidate = 30;

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
