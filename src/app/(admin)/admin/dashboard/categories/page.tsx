import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Grid, Plus, FolderTree, Search, Filter, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-2xl font-extrabold text-surface-900">التصنيفات</h1>
          <p className="text-sm text-surface-500 mt-1">تنظيم المنتجات في تصنيفات لتسهيل تجربة العميل</p>
        </div>
        <Link href="/admin/dashboard/categories/new">
            <Button className="rounded-xl gap-2 gradient-primary shadow-lg shadow-primary-500/20 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              إضافة تصنيف جديد
            </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input 
            placeholder="البحث باسم التصنيف..." 
            className="ps-10 rounded-xl border-surface-200 bg-white text-right"
          />
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories && categories.length > 0 ? (
              categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-3xl border border-surface-100 shadow-sm p-6 hover:shadow-md transition-all group flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                          <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                              <FolderTree className="h-6 w-6" />
                          </div>
                          <div className="flex items-center gap-1">
                              <Link href={`/admin/dashboard/categories/${category.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-primary-600">
                                      <Pencil className="h-4 w-4" />
                                  </Button>
                              </Link>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-surface-400 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>
                      <div className="text-right flex-1">
                          <h3 className="font-bold text-surface-900 text-lg mb-1">{category.name?.ar || category.name}</h3>
                          <p className="text-xs text-surface-400 font-mono mb-3">{category.slug}</p>
                          <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed">
                              {category.description?.ar || 'لا يوجد وصف لهذا التصنيف حالياً.'}
                          </p>
                      </div>
                  </div>
              ))
          ) : (
              <div className="col-span-full bg-surface-50 border-2 border-dashed border-surface-200 rounded-3xl p-20 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4 text-surface-400">
                      <FolderTree className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">لا توجد تصنيفات نشطة</h3>
                  <p className="text-surface-500 max-w-sm mx-auto mb-8">
                      قم بإنشاء تصنيفات لترتيب منتجاتك (مثلاً: ألعاب، برامج، اشتراكات).
                  </p>
                  <Link href="/admin/dashboard/categories/new">
                      <Button variant="secondary" className="rounded-xl">إنشاء أول تصنيف</Button>
                  </Link>
              </div>
          )}
      </div>
    </div>
  );
}
