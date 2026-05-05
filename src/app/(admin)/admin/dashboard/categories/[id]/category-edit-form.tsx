'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Save, ChevronRight, LayoutGrid, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function CategoryEditForm({ category }: { category: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name_ar: category.name?.ar || category.name || '',
        name_en: category.name?.en || '',
        slug: category.slug,
        description_ar: category.description?.ar || '',
        description_en: category.description?.en || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/dashboard/categories');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update category');
            }
        } catch (err) {
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟ سيتم إزالة التصنيف من جميع المنتجات المرتبطة به.')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/admin/dashboard/categories');
                router.refresh();
            }
        } catch (err) {
            alert('Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20" dir="rtl">
            <nav className="flex items-center gap-2 text-sm text-surface-500">
                <Link href="/admin/dashboard/categories" className="hover:text-primary-600">التصنيفات</Link>
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span className="text-surface-900 font-bold">تعديل: {formData.name_ar}</span>
            </nav>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-surface-900">تعديل التصنيف</h1>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={handleDelete} className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 gap-2">
                        <Trash2 className="h-4 w-4" /> حذف
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="rounded-xl gap-2 gradient-primary shadow-lg shadow-primary-500/20 px-8">
                        <Save className="h-4 w-4" /> {loading ? 'جاري الحفظ...' : 'تحديث'}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-surface-100 shadow-sm p-8 space-y-6 text-right">
                <div className="flex items-center gap-2 text-primary-600 mb-2">
                    <LayoutGrid className="h-5 w-5" /> <h3 className="font-bold">بيانات التصنيف</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">اسم التصنيف (AR)</label>
                        <Input required value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} className="rounded-xl bg-surface-50/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">اسم التصنيف (EN)</label>
                        <Input required value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} className="rounded-xl bg-surface-50/50" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">الرابط التعريفي (Slug)</label>
                    <Input required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="rounded-xl bg-surface-50/50 font-mono" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">وصف التصنيف</label>
                    <Textarea value={formData.description_ar} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} className="rounded-xl bg-surface-50/50 min-h-[100px]" />
                </div>
            </div>
        </div>
    );
}
