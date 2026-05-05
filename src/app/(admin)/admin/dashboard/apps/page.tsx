import { EmptyState } from '@/components/ui/empty-state';
import { AppWindow, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminAppsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900">التطبيقات</h1>
          <p className="text-sm text-surface-500 mt-1">إدارة كتالوج التطبيقات</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة تطبيق
        </Button>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-surface-200 bg-surface-50/50 p-12">
        <EmptyState
          icon={<AppWindow className="h-12 w-12" />}
          title="لا توجد تطبيقات بعد"
          description="أضف تطبيقات لعرضها في كتالوج التطبيقات على المتجر."
        />
      </div>
    </div>
  );
}
