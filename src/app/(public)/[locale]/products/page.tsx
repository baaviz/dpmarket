import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Link } from '@/lib/i18n/navigation';
import { ShoppingCart, Tag, Search, Filter } from 'lucide-react';
import { getPublicProductsCached } from '@/lib/server/public-dal/products';

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const products = await getPublicProductsCached();

  return (
    <div className="bg-surface-50 min-h-screen pt-32 pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      <Container>
        <div className="max-w-3xl mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-surface-900 mb-6 tracking-tight">
                {isAr ? 'المتجر الرقمي' : 'Digital Store'}
            </h1>
            <p className="text-xl text-surface-600 leading-relaxed">
                {isAr 
                    ? 'اكتشف مجموعتنا من الاشتراكات والمنتجات الرقمية المختارة بعناية.' 
                    : 'Discover our collection of carefully selected subscriptions and digital products.'}
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm">
                    <h3 className="font-bold text-surface-900 mb-4">{isAr ? 'البحث' : 'Search'}</h3>
                    <div className="relative">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                        <input 
                            placeholder={isAr ? 'بحث عن منتج...' : 'Search products...'} 
                            className="w-full ps-10 pe-4 py-3 rounded-2xl bg-surface-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500/20 text-sm outline-none transition-all"
                        />
                    </div>
                </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products && products.length > 0 ? (
                        products.map((product) => {
                            const name = product.name?.[locale] || product.name?.ar || product.name;
                            return (
                                <Link key={product.id} href={`/p/${product.slug}`} className="group">
                                    <div className="bg-white rounded-[32px] p-6 border border-surface-200 hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 h-full flex flex-col">
                                        <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 text-primary-600 group-hover:scale-110 transition-transform overflow-hidden">
                                            {product.image_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={product.image_url} alt={name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Tag className="h-7 w-7" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 mb-6">
                                            <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">
                                                {(() => {
                                                    const cat: any = Array.isArray(product.category) ? product.category[0] : product.category;
                                                    return cat?.name?.[locale] || cat?.name?.ar || (isAr ? 'منتج رقمي' : 'Digital');
                                                })()}
                                            </div>
                                            <h3 className="text-xl font-black text-surface-900 mb-2 truncate">{name}</h3>
                                            <p className="text-sm text-surface-500 line-clamp-2">{product.short_description?.[locale] || product.short_description?.ar || ''}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-surface-100">
                                            <span className="text-2xl font-black text-surface-900">
                                                {product.price} <span className="text-xs font-bold text-surface-500">{product.currency}</span>
                                            </span>
                                            <div className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                                                <ShoppingCart className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-32 text-center">
                            <div className="h-20 w-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6 text-surface-300">
                                <Tag className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-surface-900">{isAr ? 'لا توجد منتجات حالياً' : 'No products found'}</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </Container>
    </div>
  );
}
