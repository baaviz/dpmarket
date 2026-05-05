'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Save, Eye } from 'lucide-react';

const TEMPLATES = [
  { value: 'basic', label: 'صفحة أساسية', desc: 'صفحة محتوى بسيطة' },
  { value: 'marketing', label: 'صفحة تسويقية', desc: 'صفحة مع أقسام متعددة' },
  { value: 'help', label: 'صفحة مساعدة', desc: 'أسئلة شائعة ودعم' },
  { value: 'policy', label: 'سياسة / شروط', desc: 'سياسة خصوصية أو شروط' },
  { value: 'landing', label: 'صفحة هبوط', desc: 'صفحة تسويقية كاملة' },
];

export default function NewPageForm() {
  const [template, setTemplate] = useState('basic');
  const [status, setStatus] = useState('draft');

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-400 mb-6">
        <Link href="/admin/dashboard/pages" className="hover:text-surface-700 transition-colors">الصفحات</Link>
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <span className="text-surface-700">إنشاء صفحة جديدة</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template selection */}
          <div className="p-5 rounded-xl border border-surface-100 bg-white">
            <h3 className="text-sm font-semibold mb-3">القالب</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTemplate(t.value)}
                  className={`p-3 rounded-lg border text-start transition-colors cursor-pointer ${
                    template === t.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-surface-100 hover:border-surface-200'
                  }`}
                >
                  <p className="text-xs font-medium">{t.label}</p>
                  <p className="text-[10px] text-surface-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Arabic content */}
          <div className="p-5 rounded-xl border border-surface-100 bg-white">
            <h3 className="text-sm font-semibold mb-4">المحتوى العربي</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">العنوان *</label>
                <input type="text" className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300" placeholder="عنوان الصفحة بالعربي" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">الوصف</label>
                <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 resize-none" placeholder="وصف مختصر للصفحة" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">المحتوى</label>
                <textarea rows={8} className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 resize-none" placeholder="محتوى الصفحة (يدعم HTML)" dir="rtl" />
              </div>
            </div>
          </div>

          {/* English content */}
          <div className="p-5 rounded-xl border border-surface-100 bg-white">
            <h3 className="text-sm font-semibold mb-4">English Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Title *</label>
                <input type="text" className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300" placeholder="Page title in English" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Description</label>
                <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 resize-none" placeholder="Short page description" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Content</label>
                <textarea rows={8} className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 resize-none" placeholder="Page content (supports HTML)" dir="ltr" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish settings */}
          <div className="p-5 rounded-xl border border-surface-100 bg-white sticky top-24">
            <h3 className="text-sm font-semibold mb-4">إعدادات النشر</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">الرابط (slug) *</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-surface-400">/</span>
                  <input type="text" className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300" placeholder="page-slug" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">الحالة</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300"
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>

              {/* SEO */}
              <div className="pt-4 border-t border-surface-100">
                <h4 className="text-xs font-semibold text-surface-600 mb-3">SEO</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-surface-400 mb-1">عنوان SEO (عربي)</label>
                    <input type="text" className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-surface-400 mb-1">وصف SEO (عربي)</label>
                    <input type="text" className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-surface-400 mb-1">SEO Title (EN)</label>
                    <input type="text" className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-surface-400 mb-1">SEO Description (EN)</label>
                    <input type="text" className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300" dir="ltr" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-surface-100 flex flex-col gap-2">
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors cursor-pointer">
                  <Save className="h-4 w-4" />
                  حفظ الصفحة
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 text-surface-700 text-sm font-medium hover:bg-surface-50 transition-colors cursor-pointer">
                  <Eye className="h-4 w-4" />
                  معاينة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
