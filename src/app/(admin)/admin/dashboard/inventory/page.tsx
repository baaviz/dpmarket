import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Archive, Plus, Search, Filter, History, AlertTriangle, Key, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function AdminInventoryPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      *,
      product:products(name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-2xl font-extrabold text-surface-900">إدارة المخزون</h1>
          <p className="text-sm text-surface-500 mt-1">إضافة وإدارة أكواد التفعيل والمنتجات الرقمية</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl gap-2 border-surface-200 bg-white shadow-sm flex-1 sm:flex-none">
                <History className="h-4 w-4" />
                سجل العمليات
            </Button>
            <Button className="rounded-xl gap-2 gradient-primary shadow-lg shadow-primary-500/20 flex-1 sm:flex-none">
                <Plus className="h-4 w-4" />
                شحن مخزون جديد
            </Button>
        </div>
      </div>

      {/* Inventory Stats Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                  <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                  <h4 className="text-sm font-bold text-amber-900">تنبيهات المخزون المنخفض</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      يوجد حالياً (0) منتجات وصلت للحد الأدنى من المخزون. سيتم إخطارك هنا عند الحاجة لإعادة الشحن.
                  </p>
              </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-3xl border border-surface-100 shadow-sm p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-surface-50 flex items-center justify-center text-surface-400">
                      <Key className="h-6 w-6" />
                  </div>
                  <div>
                      <h4 className="text-sm font-bold text-surface-900">إجمالي الأكواد المتوفرة</h4>
                      <p className="text-xs text-surface-500 mt-1">جاهزة للتسليم للعملاء</p>
                  </div>
              </div>
              <div className="text-3xl font-black text-surface-900">
                  {inventory?.filter(i => !i.is_used).length || 0}
              </div>
          </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden overflow-x-auto">
          <div className="p-4 border-b border-surface-50 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <Input 
                    placeholder="البحث بالكود أو المنتج..." 
                    className="ps-10 rounded-xl border-surface-100 bg-surface-50/30 text-right"
                  />
              </div>
              <Button variant="outline" className="rounded-xl gap-2 border-surface-100">
                  <Filter className="h-4 w-4" />
                  تصفية
              </Button>
          </div>
          
          <table className="w-full text-sm text-start min-w-[800px]">
              <thead className="bg-surface-50 text-surface-500 border-b border-surface-100 uppercase text-[10px] tracking-widest font-black">
                  <tr>
                      <th className="px-6 py-4 text-start">المنتج</th>
                      <th className="px-6 py-4 text-start">رقم الكود / البيانات</th>
                      <th className="px-6 py-4 text-start">الحالة</th>
                      <th className="px-6 py-4 text-start">تاريخ الإضافة</th>
                      <th className="px-6 py-4 text-end">الإجراءات</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                  {inventory && inventory.length > 0 ? (
                      inventory.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="font-bold text-surface-900">{item.product?.name?.ar || 'منتج مجهول'}</div>
                                  <div className="text-[10px] text-surface-400 uppercase font-mono">{item.batch_id || 'Batch Default'}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="font-mono text-xs text-surface-600 bg-surface-50 px-2 py-1 rounded border border-surface-100 inline-block">
                                      {item.is_used ? '••••••••••••' : item.code_data}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  {item.is_used ? (
                                      <span className="inline-flex items-center gap-1.5 text-surface-400 bg-surface-100 px-2 py-1 rounded-md text-[10px] font-bold">
                                          <XCircle className="h-3 w-3" /> تم الاستخدام
                                      </span>
                                  ) : (
                                      <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold">
                                          <CheckCircle2 className="h-3 w-3" /> متوفر
                                      </span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-surface-500 text-xs">
                                  {new Date(item.created_at).toLocaleDateString('ar-KW')}
                              </td>
                              <td className="px-6 py-4 text-end">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 text-surface-400 hover:text-primary-600">
                                      <Plus className="h-4 w-4" />
                                  </Button>
                              </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={5} className="px-6 py-24 text-center">
                              <div className="h-20 w-20 rounded-full bg-surface-50 flex items-center justify-center mx-auto mb-6 text-surface-300">
                                  <Archive className="h-10 w-10" />
                              </div>
                              <h3 className="text-xl font-bold text-surface-900 mb-2">المخزون فارغ</h3>
                              <p className="text-surface-500 max-w-sm mx-auto">
                                  لم يتم إضافة أي أكواد تفعيل حتى الآن. ابدأ بشحن مخزونك لتتمكن من البيع.
                              </p>
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
