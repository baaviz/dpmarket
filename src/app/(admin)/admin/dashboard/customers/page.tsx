import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Users, UserPlus, Search, Filter, Mail, Phone, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function AdminCustomersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-2xl font-extrabold text-surface-900">العملاء</h1>
          <p className="text-sm text-surface-500 mt-1">قاعدة بيانات العملاء المسجلين وسجل نشاطاتهم</p>
        </div>
        <Button className="rounded-xl gap-2 gradient-primary shadow-lg shadow-primary-500/20 w-full sm:w-auto">
          <UserPlus className="h-4 w-4" />
          إضافة عميل يدوياً
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-3xl border border-surface-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input 
            placeholder="البحث بالاسم، البريد الإلكتروني، أو رقم الجوال..." 
            className="ps-11 h-12 rounded-2xl border-surface-100 bg-surface-50/50 text-right"
          />
        </div>
        <Button variant="outline" className="h-12 rounded-2xl gap-2 border-surface-100 px-6">
          <Filter className="h-4 w-4" />
          تصفية متقدمة
        </Button>
      </div>

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers && customers.length > 0 ? (
              customers.map((customer) => (
                  <div key={customer.id} className="bg-white rounded-3xl border border-surface-100 shadow-sm p-6 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-6">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 font-bold text-xl">
                              {customer.full_name?.charAt(0) || customer.mobile?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col items-end">
                              <span className="inline-flex px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Active</span>
                              <span className="text-[10px] text-surface-400 mt-1">منذ {new Date(customer.created_at).toLocaleDateString('ar-KW')}</span>
                          </div>
                      </div>
                      
                      <div className="space-y-4 mb-6 text-right">
                          <div>
                              <h4 className="font-bold text-surface-900 truncate">{customer.full_name || 'عميل دوحة بلس'}</h4>
                              <p className="text-xs text-surface-500">{customer.email || 'لا يوجد بريد إلكتروني'}</p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-xs text-surface-600 justify-end">
                                  <span>{customer.mobile}</span>
                                  <Phone className="h-3 w-3 text-surface-400" />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-surface-600 justify-end">
                                  <span>{customer.orders_count || 0} طلبات مكتملة</span>
                                  <ShoppingBag className="h-3 w-3 text-surface-400" />
                              </div>
                          </div>
                      </div>

                      <Button variant="outline" className="w-full rounded-xl group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all text-xs font-bold gap-2">
                          <ArrowRight className="h-4 w-4 rotate-180" />
                          عرض الملف الشخصي
                      </Button>
                  </div>
              ))
          ) : (
              <div className="col-span-full bg-white rounded-3xl border border-surface-100 p-20 text-center shadow-sm">
                <div className="h-20 w-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6 text-primary-600">
                  <Users className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-2">لا يوجد عملاء حالياً</h3>
                <p className="text-surface-500 max-w-sm mx-auto mb-8">
                  عندما يقوم العملاء بتقديم طلباتهم، ستظهر بياناتهم هنا تلقائياً لتتمكن من إدارتها.
                </p>
                <Button variant="outline" className="rounded-xl">دعوة عملاء للتسجيل</Button>
              </div>
          )}
      </div>
    </div>
  );
}
