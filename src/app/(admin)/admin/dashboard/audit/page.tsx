import { EmptyState } from '@/components/ui/empty-state';
import { ScrollText } from 'lucide-react';

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-900">سجل النشاط</h1>
        <p className="text-sm text-surface-500 mt-1">تتبع جميع العمليات والتغييرات</p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-surface-200 bg-surface-50/50 p-12">
        <EmptyState
          icon={<ScrollText className="h-12 w-12" />}
          title="لا توجد سجلات بعد"
          description="سيتم تسجيل جميع العمليات والتغييرات تلقائياً عند بدء استخدام النظام."
        />
      </div>
    </div>
  );
}
