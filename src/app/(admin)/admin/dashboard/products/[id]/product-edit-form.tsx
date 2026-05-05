'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Save, X, ChevronRight, Globe, Info, CreditCard, Tag, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ProductEditForm({ product }: { product: any }) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name_ar: product.name?.ar || product.name || '',
        name_en: product.name?.en || '',
        slug: product.slug,
        description_ar: product.description?.ar || '',
        description_en: product.description?.en || '',
        price: product.price.toString(),
        currency: product.currency,
        type: product.type,
        is_active: product.is_active,
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        purchase_link: product.purchase_link || '',
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err: any) {
            alert('خطأ في رفع الصورة: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/dashboard/products');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update product');
            }
        } catch (err) {
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/admin/dashboard/products');
                router.refresh();
            }
        } catch (err) {
            alert('Failed to delete product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32" dir="rtl">
            <nav className="flex items-center gap-2 text-xs text-surface-400">
                <Link href="/admin/dashboard/products" className="hover:text-primary-600 transition-colors">المنتجات</Link>
                <ChevronRight className="h-3 w-3 rotate-180" />
                <span className="text-surface-900 font-bold">تعديل المنتج</span>
            </nav>

            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-surface-900 tracking-tight">تعديل المنتج</h1>
                    <p className="text-surface-500 mt-1">تحديث بيانات المنتج والصورة والمخزون</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={handleDelete}
                        className="rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 h-12 px-6"
                    >
                        <Trash2 className="h-4 w-4 ms-2" />
                        حذف
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="rounded-2xl gap-2 gradient-primary shadow-xl shadow-primary-500/30 px-10 h-12 text-sm font-black"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'جاري الحفظ...' : 'تحديث البيانات'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[32px] border border-surface-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 text-primary-600 border-b border-surface-50 pb-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary-50 flex items-center justify-center">
                                <Info className="h-5 w-5" />
                            </div>
                            <h3 className="font-black text-lg">المعلومات الأساسية</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-surface-400 uppercase tracking-widest">الاسم بالعربية</label>
                                <Input required value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-surface-400 uppercase tracking-widest">الاسم بالإنجليزية</label>
                                <Input required value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-400 uppercase tracking-widest">الرابط التعريفي (Slug)</label>
                            <Input required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50 font-mono" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-400 uppercase tracking-widest">الوصف بالعربية</label>
                            <Textarea required value={formData.description_ar} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} className="rounded-2xl bg-surface-50/50 min-h-[150px]" />
                        </div>
                    </div>

                    {/* Inventory & Codes Section */}
                    <div className="bg-white rounded-[32px] border border-surface-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-surface-50 pb-4">
                            <div className="flex items-center gap-3 text-amber-600">
                                <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <Package className="h-5 w-5" />
                                </div>
                                <h3 className="font-black text-lg">المخزون والأكواد</h3>
                            </div>
                            <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-tighter">Inventory Management</span>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-900 leading-relaxed font-bold">
                                    إضافة أكواد جديدة سيؤدي لشحن المخزون تلقائياً. الكود الواحد لكل سطر.
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-surface-400 uppercase tracking-widest">إضافة أكواد جديدة</label>
                                <Textarea 
                                    placeholder="أدخل الأكواد الجديدة هنا... (كود واحد في كل سطر)"
                                    value={(formData as any).codes_raw || ''}
                                    onChange={(e) => setFormData({...formData, codes_raw: e.target.value} as any)}
                                    className="rounded-2xl bg-surface-50/50 border-transparent focus:bg-white transition-all min-h-[150px] font-mono text-xs" 
                                />
                                {(formData as any).codes_raw && (
                                    <div className="text-[10px] text-primary-600 font-bold px-1">سيتم إضافة {(formData as any).codes_raw.split('\n').filter((l: string) => l.trim()).length} كود جديد للمخزون.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Image Upload */}
                    <div className="bg-white rounded-[32px] border border-surface-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 text-surface-900 border-b border-surface-50 pb-4">
                            <div className="h-8 w-8 rounded-xl bg-surface-50 flex items-center justify-center">
                                <ImageIcon className="h-4 w-4" />
                            </div>
                            <h3 className="font-black text-sm">صورة المنتج</h3>
                        </div>

                        <div className="space-y-4">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-[32px] border-2 border-dashed border-surface-200 bg-surface-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group relative overflow-hidden"
                            >
                                {formData.image_url ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={formData.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                            <Upload className="h-8 w-8 mb-2" />
                                            <span className="text-xs font-black">تغيير الصورة</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            {uploading ? <Loader2 className="h-6 w-6 text-primary-600 animate-spin" /> : <Upload className="h-6 w-6 text-surface-400" />}
                                        </div>
                                        <span className="text-xs font-bold text-surface-500">اضغط لرفع صورة</span>
                                        <span className="text-[10px] text-surface-300 mt-1">PNG, JPG (Max 5MB)</span>
                                    </>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            {formData.image_url && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setFormData({...formData, image_url: ''})}
                                    className="w-full text-[10px] font-black text-red-500"
                                >
                                    حذف الصورة
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-[32px] border border-surface-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 text-emerald-600 border-b border-surface-50 pb-4">
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <h3 className="font-black text-sm">التسعير</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest">السعر</label>
                                <div className="relative">
                                    <Input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50 font-black" />
                                    <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-black text-surface-400">{formData.currency}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 pt-4 border-t border-surface-50">
                                <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> رابط شراء مخصص (اختياري)
                                </label>
                                <Input 
                                    placeholder="مثلاً: رابط واتساب أو صفحة هبوط" 
                                    value={formData.purchase_link || ''} 
                                    onChange={(e) => setFormData({...formData, purchase_link: e.target.value})} 
                                    className="rounded-2xl h-10 bg-surface-50/50 text-xs font-medium" 
                                />
                                <p className="text-[9px] text-surface-400">إذا تركت هذا الحقل فارغاً، سيتم توجيه العميل لصفحة الدفع الافتراضية.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
