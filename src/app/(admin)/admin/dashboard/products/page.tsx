import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Package, Plus, Search, Filter, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900">المنتجات</h1>
          <p className="text-sm text-surface-500 mt-1">إدارة أكواد التفعيل والمنتجات الرقمية المعروضة في المتجر</p>
        </div>
        <Link href="/admin/dashboard/products/new">
            <Button className="rounded-xl gap-2 gradient-primary shadow-lg shadow-primary-500/20 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              إضافة منتج جديد
            </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input 
            placeholder="البحث باسم المنتج أو الـ Slug..." 
            className="ps-10 rounded-xl border-surface-200 bg-white"
          />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2 border-surface-200 bg-white flex-1 sm:flex-none">
              <Filter className="h-4 w-4" />
              التصنيفات
            </Button>
            <Button variant="outline" className="rounded-xl gap-2 border-surface-200 bg-white flex-1 sm:flex-none">
              <Filter className="h-4 w-4" />
              الحالة
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-start min-w-[800px]">
              <thead className="bg-surface-50 text-surface-500 border-b border-surface-100">
                  <tr>
                      <th className="px-6 py-4 font-bold text-start">المنتج</th>
                      <th className="px-6 py-4 font-bold text-start">التصنيف</th>
                      <th className="px-6 py-4 font-bold text-start">النوع</th>
                      <th className="px-6 py-4 font-bold text-start">السعر</th>
                      <th className="px-6 py-4 font-bold text-start">الحالة</th>
                      <th className="px-6 py-4 font-bold text-end">الإجراءات</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                  {products && products.length > 0 ? (
                      products.map((product) => (
                          <tr key={product.id} className="hover:bg-surface-50/50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-surface-100 flex items-center justify-center text-surface-400">
                                          <Package className="h-5 w-5" />
                                      </div>
                                      <div>
                                          <div className="font-bold text-surface-900">{product.name.ar || product.name}</div>
                                          <div className="text-[10px] text-surface-400 font-mono uppercase">{product.slug}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="text-surface-600">{product.category?.name?.ar || 'غير مصنف'}</span>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="inline-flex px-2 py-1 rounded-md bg-surface-100 text-[10px] font-bold text-surface-600 uppercase">
                                      {product.type.replace('_', ' ')}
                                  </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-surface-900">
                                  {product.price} {product.currency}
                              </td>
                              <td className="px-6 py-4">
                                  {product.is_active ? (
                                      <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold">
                                          <div className="h-1 w-1 rounded-full bg-emerald-600" />
                                          نشط
                                      </span>
                                  ) : (
                                      <span className="inline-flex items-center gap-1.5 text-surface-400 bg-surface-100 px-2 py-1 rounded-md text-[10px] font-bold">
                                          <div className="h-1 w-1 rounded-full bg-surface-400" />
                                          مسودة
                                      </span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-end">
                                  <div className="flex items-center justify-end gap-1">
                                      <Link href={`/admin/dashboard/products/${product.id}`}>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-primary-600">
                                              <Pencil className="h-4 w-4" />
                                          </Button>
                                      </Link>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-red-600">
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </div>
                              </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={6} className="px-6 py-24 text-center">
                              <div className="h-20 w-20 rounded-3xl bg-surface-50 flex items-center justify-center mx-auto mb-6 text-surface-300">
                                  <Package className="h-10 w-10" />
                              </div>
                              <h3 className="text-xl font-bold text-surface-900 mb-2">لا توجد منتجات بعد</h3>
                              <p className="text-surface-500 max-w-sm mx-auto mb-8">
                                  ابدأ بإضافة أول منتج لمتجرك لتتمكن من عرضه للعملاء.
                              </p>
                              <Link href="/admin/dashboard/products/new">
                                  <Button className="rounded-xl gradient-primary">إنشاء أول منتج</Button>
                              </Link>
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
