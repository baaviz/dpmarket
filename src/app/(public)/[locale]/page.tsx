import { HeroSection } from '@/components/marketing/hero-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { AppsShowcaseSection } from '@/components/marketing/apps-showcase-section';
import { ProductsShowcaseSection } from '@/components/marketing/products-showcase-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { CtaBanner } from '@/components/marketing/cta-banner';
import { getHomePageDataCached } from '@/lib/server/public-dal/home';

// Revalidate every 5 minutes using ISR cache
export const revalidate = 300;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Single fast cached query for the whole homepage
  const { settings, featuredApps, featuredProducts, products } = await getHomePageDataCached();
  
  // Use featured product if available, otherwise just use first active product
  const primaryProduct = featuredProducts.length > 0 ? featuredProducts[0] : products[0];

  return (
    <>
      <HeroSection locale={locale} product={primaryProduct} settings={settings} />
      <ProductsShowcaseSection locale={locale} products={featuredProducts.length > 0 ? featuredProducts : products} />
      <FeaturesSection locale={locale} />
      <AppsShowcaseSection locale={locale} apps={featuredApps} settings={settings} />
      <FaqSection locale={locale} />
      <CtaBanner locale={locale} />
    </>
  );
}
