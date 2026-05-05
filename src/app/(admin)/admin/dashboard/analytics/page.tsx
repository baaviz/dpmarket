import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: orders } = await supabase.from('orders').select('*');
  const { count: totalCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true });

  const revenue = orders?.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;
  const totalOrders = orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-900 text-right">التحليلات والتقارير</h1>
        <p className="text-sm text-surface-500 mt-1 text-right">تتبع نمو مبيعاتك، سلوك العملاء، وأداء المنتجات</p>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
              { label: 'إجمالي المبيعات', value: `${revenue.toFixed(2)} د.ك`, trend: '+12.5%', icon: DollarSign, positive: true },
              { label: 'عدد الطلبات', value: totalOrders, trend: '+8.2%', icon: ShoppingCart, positive: true },
              { label: 'إجمالي العملاء', value: totalCustomers || 0, trend: '+5.1%', icon: Users, positive: true },
              { label: 'متوسط قيمة الطلب', value: `${avgOrderValue.toFixed(2)} د.ك`, trend: '-2.4%', icon: Activity, positive: false },
          ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-3xl border border-surface-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 end-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <stat.icon className="h-16 w-16" />
                  </div>
                  <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="flex items-end gap-3">
                    <p className="text-2xl font-black text-surface-900">{stat.value}</p>
                    <div className={`flex items-center gap-0.5 text-[10px] font-bold mb-1 ${stat.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {stat.trend}
                    </div>
                  </div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart (CSS Based) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-surface-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-surface-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary-600" />
                      مخطط الإيرادات الأسبوعي
                  </h3>
                  <select className="bg-surface-50 border-none rounded-lg text-xs font-bold px-3 py-1.5 outline-none text-surface-600 cursor-pointer">
                      <option>آخر 7 أيام</option>
                      <option>آخر 30 يوم</option>
                  </select>
              </div>

              <div className="h-64 flex items-end gap-2 sm:gap-4 px-2">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                          <div className="w-full bg-primary-50 rounded-t-xl relative overflow-hidden transition-all duration-500 group-hover:bg-primary-100" style={{ height: `${h}%` }}>
                              <div className="absolute bottom-0 inset-x-0 bg-primary-600 transition-all duration-700 h-0 group-hover:h-full opacity-10" />
                          </div>
                          <span className="text-[10px] font-bold text-surface-400">
                              {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][i]}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm p-8">
              <h3 className="font-bold text-surface-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  المنتجات الأكثر مبيعاً
              </h3>
              <div className="space-y-5">
                  {[
                      { name: 'اشتراك بلس سنوي', sales: 42, color: 'bg-primary-500' },
                      { name: 'كود فيفا 24', sales: 28, color: 'bg-emerald-500' },
                      { name: 'بطاقة آيتونز 50$', sales: 15, color: 'bg-amber-500' },
                  ].map((p, i) => (
                      <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                              <span className="text-surface-700">{p.name}</span>
                              <span className="text-surface-400">{p.sales} طلب</span>
                          </div>
                          <div className="h-2 w-full bg-surface-50 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.sales/42)*100}%` }} />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
