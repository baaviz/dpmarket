import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ShoppingCart, Search, Filter, DownloadCloud, Calendar, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  // Simple stats calculation
  const totalPaid = orders?.filter(o => o.payment_status === 'paid').length || 0;
  const totalPending = orders?.filter(o => o.payment_status === 'pending').length || 0;
  const totalRevenue = orders?.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;

  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'paid': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold"><CheckCircle2 className="h-3 w-3" /> تم الدفع</span>;
          case 'pending': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold"><Clock className="h-3 w-3" /> بانتظار الدفع</span>;
          case 'failed': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold"><XCircle className="h-3 w-3" /> فشل الدفع</span>;
          default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-100 text-surface-500 text-[10px] font-bold">{status}</span>;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900">الطلبات</h1>
          <p className="text-sm text-surface-500 mt-1">إدارة ومتابعة جميع عمليات الشراء والمدفوعات</p>
        </div>
        <Button variant="outline" className="rounded-xl gap-2 border-surface-200 bg-white shadow-sm">
          <DownloadCloud className="h-4 w-4" />
          تصدير التقرير
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
              { label: 'إجمالي الطلبات', value: orders?.length || 0, color: 'text-surface-900', icon: ShoppingCart },
              { label: 'طلبات مدفوعة', value: totalPaid, color: 'text-emerald-600', icon: CheckCircle2 },
              { label: 'بانتظار الدفع', value: totalPending, color: 'text-amber-600', icon: Clock },
              { label: 'إجمالي الإيرادات', value: `${totalRevenue.toFixed(2)} د.ك`, color: 'text-primary-600', icon: ShoppingCart },
          ].map((s) => (
              <div key={s.label} className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{s.label}</p>
                    <p className={cn("text-xl font-black mt-1", s.color)}>{s.value}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-surface-50 flex items-center justify-center text-surface-300">
                      <s.icon className="h-5 w-5" />
                  </div>
              </div>
          ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-2 rounded-2xl border border-surface-100 shadow-sm flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input 
            placeholder="رقم الطلب، اسم العميل، أو رقم الجوال..." 
            className="ps-11 h-12 rounded-xl border-transparent bg-transparent focus-visible:ring-0"
          />
        </div>
        <div className="flex gap-2 p-1">
            <Button variant="ghost" className="rounded-xl gap-2 h-10 text-surface-600 hover:bg-surface-50">
                <Calendar className="h-4 w-4 text-surface-400" />
                تاريخ الطلب
            </Button>
            <div className="w-px h-6 bg-surface-100 my-auto" />
            <Button variant="ghost" className="rounded-xl gap-2 h-10 text-surface-600 hover:bg-surface-50">
                <Filter className="h-4 w-4 text-surface-400" />
                تصفية النتائج
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-start min-w-[900px]">
              <thead className="bg-surface-50 text-surface-500 border-b border-surface-100 uppercase text-[10px] tracking-widest font-black">
                  <tr>
                      <th className="px-6 py-4 text-start">رقم الطلب</th>
                      <th className="px-6 py-4 text-start">العميل</th>
                      <th className="px-6 py-4 text-start">المبلغ</th>
                      <th className="px-6 py-4 text-start">حالة الدفع</th>
                      <th className="px-6 py-4 text-start">التاريخ</th>
                      <th className="px-6 py-4 text-end">الإجراءات</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                  {orders && orders.length > 0 ? (
                      orders.map((order) => (
                          <tr key={order.id} className="hover:bg-surface-50/50 transition-colors group">
                              <td className="px-6 py-4 font-bold text-surface-900">
                                  #{order.public_order_number}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="font-medium text-surface-900">{order.customer_mobile_e164}</div>
                                  <div className="text-[10px] text-surface-400">{order.customer_country || 'الكويت'}</div>
                              </td>
                              <td className="px-6 py-4 font-black text-surface-900">
                                  {Number(order.total_amount).toFixed(2)} {order.currency}
                              </td>
                              <td className="px-6 py-4">
                                  {getStatusBadge(order.payment_status)}
                              </td>
                              <td className="px-6 py-4 text-surface-500 text-xs">
                                  {new Date(order.created_at).toLocaleDateString('ar-KW', {
                                      year: 'numeric', month: 'short', day: 'numeric'
                                  })}
                              </td>
                              <td className="px-6 py-4 text-end">
                                  <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-bold gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Eye className="h-3.5 w-3.5" />
                                      تفاصيل
                                  </Button>
                              </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={6} className="px-6 py-24 text-center">
                              <div className="h-20 w-20 rounded-3xl bg-surface-50 flex items-center justify-center mx-auto mb-6 text-surface-300">
                                  <ShoppingCart className="h-10 w-10" />
                              </div>
                              <h3 className="text-xl font-bold text-surface-900 mb-2">لا توجد طلبات حتى الآن</h3>
                              <p className="text-surface-500 max-w-sm mx-auto">
                                  سيتم عرض جميع الطلبات هنا بمجرد أن يبدأ العملاء في التسوق من متجرك.
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
