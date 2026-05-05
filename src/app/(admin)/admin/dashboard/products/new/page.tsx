'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Save, X, ChevronRight, Globe, Info, CreditCard, Tag, Key, AlertCircle, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function NewProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        slug: '',
        description_ar: '',
        description_en: '',
        price: '',
        currency: 'KWD',
        type: 'activation_code',
        is_active: true,
        category_id: '',
        codes_raw: '',
        image_url: '',
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

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err: any) {
            setError('خطأ في رفع الصورة: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(text || 'Server returned a non-JSON response');
            }

            if (res.ok) {
                router.push('/admin/dashboard/products');
                router.refresh();
            } else {
                setError(data?.error || `Error ${res.status}: ${res.statusText}`);
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'حدث خطأ أثناء الاتصال بالخادم.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4" dir="rtl">
            <div className="flex flex-col gap-4">
                <nav className="flex items-center gap-2 text-xs text-surface-400">
                    <Link href="/admin/dashboard/products" className="hover:text-primary-600 transition-colors">المنتجات</Link>
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    <span className="text-surface-900 font-bold">إضافة منتج جديد</span>
                </nav>

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-surface-900 tracking-tight">إضافة منتج وأكواد</h1>
                        <p className="text-surface-500 mt-1">قم بإنشاء المنتج وشحن المخزون في خطوة واحدة</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/dashboard/products">
                            <Button variant="ghost" className="rounded-xl px-6 text-surface-500 hover:text-surface-900">إلغاء</Button>
                        </Link>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className="rounded-2xl gap-2 gradient-primary shadow-xl shadow-primary-500/30 px-10 h-12 text-sm font-black"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? 'جاري الحفظ...' : 'حفظ ونشر'}
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 animate-shake">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-bold">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                                <label className="text-xs font-black text-surface-400 uppercase tracking-widest">اسم المنتج (بالعربية)</label>
                                <Input required placeholder="مثلاً: كود اشتراك شاهد VIP" value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-surface-400 uppercase tracking-widest">اسم المنتج (بالإنجليزية)</label>
                                <Input required placeholder="Shahid VIP Subscription" value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-400 uppercase tracking-widest">الرابط التعريفي (Slug)</label>
                            <Input required placeholder="shahid-vip-3-months" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50 font-mono" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-surface-400 uppercase tracking-widest">وصف المنتج (بالعربية)</label>
                            <Textarea required placeholder="صف مميزات المنتج وكيفية التفعيل..." value={formData.description_ar} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} className="rounded-2xl bg-surface-50/50 min-h-[150px]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-surface-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-surface-50 pb-4">
                            <div className="flex items-center gap-3 text-amber-600">
                                <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <Key className="h-5 w-5" />
                                </div>
                                <h3 className="font-black text-lg">مخزون الأكواد</h3>
                            </div>
                        </div>
                        <Textarea 
                            placeholder="أدخل الأكواد هنا (كود واحد في كل سطر)..."
                            value={formData.codes_raw}
                            onChange={(e) => setFormData({...formData, codes_raw: e.target.value})}
                            className="rounded-2xl bg-surface-50/50 border-transparent min-h-[200px] font-mono text-xs" 
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
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
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-surface-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 text-emerald-600 border-b border-surface-50 pb-4">
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <h3 className="font-black text-sm">التسعير</h3>
                        </div>
                        <div className="relative">
                            <Input type="number" step="0.01" required placeholder="0.000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-2xl h-12 bg-surface-50/50 font-black" />
                            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-black text-surface-400">KWD</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
