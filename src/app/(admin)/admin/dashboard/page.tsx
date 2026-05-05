import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Archive,
  AlertCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Stats will be fetched from database when connected
  const stats = [
    { label: 'إجمالي الطلبات', value: '0', icon: ShoppingCart, color: 'bg-primary-50 text-primary-600' },
    { label: 'الإيرادات', value: '0 د.ك', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'المنتجات', value: '0', icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'الأكواد المتوفرة', value: '0', icon: Archive, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900">لوحة التحكم</h1>
          <p className="text-sm text-surface-500 mt-1">نظرة عامة على أداء متجر دوحة بلس</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-surface-200 text-sm font-medium text-surface-600 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            النظام مستقر
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-surface-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-surface-300" />
            </div>
            <p className="text-2xl font-extrabold text-surface-900">{stat.value}</p>
            <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-surface-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                          <Zap className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-bold text-surface-900">البداية السريعة</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/admin/dashboard/enrichment" className="group p-4 rounded-xl border border-surface-100 bg-surface-50/50 hover:bg-white hover:border-primary-200 transition-all">
                          <h4 className="font-bold text-surface-900 group-hover:text-primary-600">تحديث التطبيقات</h4>
                          <p className="text-xs text-surface-500 mt-1">استيراد التطبيقات من Doha Plus وتحديث بياناتها.</p>
                      </Link>
                      <Link href="/admin/dashboard/products" className="group p-4 rounded-xl border border-surface-100 bg-surface-50/50 hover:bg-white hover:border-primary-200 transition-all">
                          <h4 className="font-bold text-surface-900 group-hover:text-primary-600">إضافة منتجات</h4>
                          <p className="text-xs text-surface-500 mt-1">إنشاء أكواد تفعيل جديدة أو منتجات رقمية.</p>
                      </Link>
                      <Link href="/admin/dashboard/pages" className="group p-4 rounded-xl border border-surface-100 bg-surface-50/50 hover:bg-white hover:border-primary-200 transition-all">
                          <h4 className="font-bold text-surface-900 group-hover:text-primary-600">إدارة الصفحات</h4>
                          <p className="text-xs text-surface-500 mt-1">تخصيص الصفحات التعريفية وسياسات المتجر.</p>
                      </Link>
                      <Link href="/admin/dashboard/settings" className="group p-4 rounded-xl border border-surface-100 bg-surface-50/50 hover:bg-white hover:border-primary-200 transition-all">
                          <h4 className="font-bold text-surface-900 group-hover:text-primary-600">الإعدادات العامة</h4>
                          <p className="text-xs text-surface-500 mt-1">تكوين بوابات الدفع وإعدادات المتجر الأساسية.</p>
                      </Link>
                  </div>
              </div>
          </div>

          {/* Status Panel */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <h3 className="font-bold text-surface-900 mb-4">حالة النظام</h3>
              <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-surface-50">
                      <span className="text-sm text-surface-500">قاعدة البيانات</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">متصل</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-surface-50">
                      <span className="text-sm text-surface-500">بوابة الدفع</span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">قيد الإعداد</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-surface-500">خدمة الواتساب</span>
                      <span className="text-xs font-bold text-surface-400 bg-surface-100 px-2 py-1 rounded-md">غير مفعل</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Empty State */}
      <div className="rounded-2xl border-2 border-dashed border-surface-200 bg-surface-50/50 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-surface-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-surface-700 mb-2">لا توجد طلبات اليوم</h3>
        <p className="text-sm text-surface-500 max-w-md mx-auto">
          بمجرد أن يبدأ العملاء بالشراء، ستظهر هنا إحصائيات المبيعات والطلبات الأخيرة.
        </p>
      </div>
    </div>
  );
}
