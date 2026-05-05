import { setRequestLocale } from 'next-intl/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from '@/lib/i18n/navigation';
import { CheckoutForm } from './checkout-form';

export const revalidate = 0; // Don't cache checkout

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const { locale } = await params;
  const { product: productSlug } = await searchParams;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  let query = supabase.from('products').select('slug, name, price, currency').eq('is_active', true);
  
  if (productSlug) {
      query = query.eq('slug', productSlug);
  } else {
      // Get the default active product if none specified
      query = query.order('sort_order', { ascending: true }).limit(1);
  }

  const { data: product } = await query.single();

  if (!product) {
      // If no active products exist, redirect to products page
      redirect({ href: '/products', locale });
      return null;
  }

  return <CheckoutForm product={product} />;
}
