import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ShoppingCart, ShieldCheck, Zap, MessageCircle, ArrowRight, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: product } = await supabase
    .from('products')
    .select('*, category:product_categories(name)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  const name = product.name?.[locale] || product.name?.ar || product.name;
  const description = product.description?.[locale] || product.description?.ar || '';

  return (
    <div className="bg-white min-h-screen pt-32 pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Product Visuals */}
            <div className="space-y-8">
                <div className="aspect-square rounded-[48px] bg-surface-50 border border-surface-100 flex items-center justify-center relative overflow-hidden group shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <Tag className="h-32 w-32 text-primary-600 drop-shadow-2xl animate-float" />
                    )}
                </div>
                
                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: Zap, label: isAr ? 'تسليم فوري' : 'Instant' },
                        { icon: ShieldCheck, label: isAr ? 'آمن 100%' : 'Secure' },
                        { icon: MessageCircle, label: isAr ? 'دعم فني' : 'Support' },
                    ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-surface-50 border border-surface-100">
                            <badge.icon className="h-5 w-5 text-surface-400" />
                            <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Product Info & Buy */}
            <div className="space-y-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest">
                        {(() => {
                            const cat: any = Array.isArray(product.category) ? product.category[0] : product.category;
                            return cat?.name?.[locale] || cat?.name?.ar || (isAr ? 'منتج رقمي' : 'Digital Product');
                        })()}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-surface-900 tracking-tight leading-tight">
                        {name}
                    </h1>
                    <p className="text-xl text-surface-500 leading-relaxed max-w-xl">
                        {product.short_description?.[locale] || product.short_description?.ar || (isAr ? 'احصل على الكود الخاص بك فوراً بعد الدفع.' : 'Get your code instantly after payment.')}
                    </p>
                </div>

                <div className="p-8 rounded-[40px] bg-surface-950 text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden">
                    <div className="absolute top-0 end-0 p-8 opacity-10">
                        <ShoppingCart className="h-24 w-24" />
                    </div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">{isAr ? 'السعر النهائي' : 'Final Price'}</span>
                                <div className="text-5xl font-black flex items-baseline gap-2">
                                    {product.price}
                                    <span className="text-lg font-bold opacity-60">{product.currency}</span>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{isAr ? 'متوفر بالمخزون' : 'In Stock'}</div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-1 w-4 rounded-full bg-emerald-500/30" />)}
                                </div>
                            </div>
                        </div>

                        <Link href={product.purchase_link || `/${locale}/checkout?product=${product.slug}`}>
                            <Button className="w-full h-16 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white text-lg font-black shadow-xl shadow-primary-600/20 group transition-all">
                                {isAr ? 'اشترِ الآن - دفع آمن' : 'Buy Now - Secure Pay'}
                                <ArrowRight className={`ms-2 h-5 w-5 transition-transform group-hover:translate-x-1 ${isAr && 'rotate-180 group-hover:-translate-x-1'}`} />
                            </Button>
                        </Link>

                        <p className="text-[10px] text-center text-surface-400 font-medium">
                            {isAr 
                                ? 'بالضغط على "اشترِ الآن"، فإنك توافق على شروط الخدمة وسياسة الاسترجاع.' 
                                : 'By clicking "Buy Now", you agree to our Terms of Service and Refund Policy.'}
                        </p>
                    </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-6 pt-8 border-t border-surface-100">
                    <h3 className="text-lg font-black text-surface-900 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary-600" />
                        {isAr ? 'تفاصيل المنتج' : 'Product Details'}
                    </h3>
                    <div className="prose prose-surface max-w-none text-surface-600 leading-loose">
                        {description || (isAr ? 'لا يوجد وصف تفصيلي متوفر لهذا المنتج.' : 'No detailed description available for this product.')}
                    </div>
                </div>
            </div>
        </div>
      </Container>
    </div>
  );
}
