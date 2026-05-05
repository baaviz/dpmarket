import { getAdminSession } from '@/lib/server/services/admin/admin-auth.service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, Globe, Eye, Pencil } from 'lucide-react';

export default async function AdminPagesPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-surface-900">إدارة الصفحات</h1>
          <p className="text-sm text-surface-500 mt-1">إنشاء وإدارة صفحات المحتوى المخصص</p>
        </div>
        <Link
          href="/admin/dashboard/pages/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          إنشاء صفحة جديدة
        </Link>
      </div>

      {/* Page templates guide */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'صفحة أساسية', type: 'basic', icon: FileText },
          { label: 'صفحة تسويقية', type: 'marketing', icon: Globe },
          { label: 'صفحة مساعدة', type: 'help', icon: FileText },
          { label: 'سياسة / شروط', type: 'policy', icon: FileText },
          { label: 'صفحة هبوط', type: 'landing', icon: Eye },
        ].map(({ label, type, icon: Icon }) => (
          <div key={type} className="p-4 rounded-xl border border-surface-100 text-center">
            <Icon className="h-5 w-5 mx-auto mb-2 text-surface-400" />
            <p className="text-xs font-medium text-surface-700">{label}</p>
            <p className="text-[10px] text-surface-400 mt-0.5">{type}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="border border-dashed border-surface-200 rounded-2xl p-16 text-center">
        <FileText className="h-10 w-10 mx-auto mb-4 text-surface-300" />
        <h3 className="text-base font-semibold text-surface-700 mb-1">لا توجد صفحات بعد</h3>
        <p className="text-sm text-surface-400 mb-6 max-w-sm mx-auto">
          أنشئ صفحات مخصصة لسياسة الخصوصية، الشروط والأحكام، أو صفحات تسويقية
        </p>
        <Link
          href="/admin/dashboard/pages/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          إنشاء أول صفحة
        </Link>
      </div>

      {/* Info card: how page builder works */}
      <div className="mt-8 p-5 rounded-xl bg-surface-50 border border-surface-100">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Pencil className="h-4 w-4 text-primary-600" />
          كيف يعمل منشئ الصفحات؟
        </h4>
        <ul className="text-xs text-surface-500 space-y-1.5 ms-6 list-disc">
          <li>أنشئ صفحة جديدة واختر القالب المناسب</li>
          <li>أضف المحتوى باللغتين العربية والإنجليزية</li>
          <li>خصّص حقول SEO (العنوان، الوصف، صورة OG)</li>
          <li>أضف أقسام المحتوى: نص، صورة، FAQ، CTA، معرض</li>
          <li>انشر الصفحة لتظهر تحت /{'{slug}'}</li>
          <li>يمكنك تغيير الحالة (مسودة / منشور / مؤرشف) في أي وقت</li>
        </ul>
      </div>
    </div>
  );
}
