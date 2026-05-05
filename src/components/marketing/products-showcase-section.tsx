import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Link } from '@/lib/i18n/navigation';
import { ShoppingCart, Tag, Star, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export async function ProductsShowcaseSection({ locale, products }: { locale: string, products: any[] }) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  if (!products || products.length === 0) return null;

  return (
    <Section className="bg-white py-24 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/5 via-transparent to-transparent pointer-events-none" />

      <Container className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-black uppercase tracking-widest mb-4">
               <Star className="h-3 w-3 fill-current" />
               {isAr ? 'الأكثر مبيعاً' : 'Best Sellers'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-surface-900 tracking-tight mb-4">
              {isAr ? 'منتجاتنا وخدماتنا' : 'Our Products & Services'}
            </h2>
            <p className="text-lg text-surface-600 leading-relaxed">
              {isAr 
                ? 'اشتراكات حصرية وأكواد تفعيل بأفضل الأسعار، تسليم فوري وآمن.' 
                : 'Exclusive subscriptions and activation codes at the best prices, instant and secure delivery.'}
            </p>
          </div>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold group whitespace-nowrap"
          >
            {isAr ? 'عرض كل المنتجات' : 'View All Products'}
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const name = product.name?.[locale] || product.name?.ar || product.name || 'منتج';
            const description = product.short_description?.[locale] || product.short_description?.ar || '';
            
            return (
              <Link key={product.id} href={`/p/${product.slug}`} className="group relative">
                <div className="bg-surface-50 rounded-[32px] p-6 border border-surface-100 hover:border-primary-500/30 hover:bg-white hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 flex flex-col h-full">
                    {/* Product Image */}
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 overflow-hidden">
                        {product.image_url ? (
                            <Image src={product.image_url} alt={name} fill sizes="56px" className="object-cover" />
                        ) : (
                            <Tag className="h-7 w-7 text-primary-600" />
                        )}
                    </div>

                    <div className="flex-1 mb-6 text-right">
                        <h3 className="text-xl font-black text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {name}
                        </h3>
                        <p className="text-sm text-surface-500 line-clamp-2 leading-relaxed">
                            {description || (isAr ? 'منتج رقمي عالي الجودة مع تسليم فوري.' : 'High-quality digital product with instant delivery.')}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-surface-200/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{isAr ? 'السعر' : 'Price'}</span>
                            <span className="text-xl font-black text-surface-900">
                                {product.price} <span className="text-xs font-bold text-surface-500">{product.currency}</span>
                            </span>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:bg-primary-700 transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                    </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
