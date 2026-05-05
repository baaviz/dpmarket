import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Settings, Globe, CreditCard, MessageCircle, Shield, Bell, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  // Fetch all settings
  const { data: rawSettings } = await supabase.from('settings').select('*');
  
  // Transform settings into a key-value object for easy access
  const settings = (rawSettings || []).reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 text-right">إعدادات المتجر</h1>
          <p className="text-sm text-surface-500 mt-1 text-right">تكوين الهوية البصرية، طرق الدفع، وخدمات التواصل</p>
        </div>
        <Button className="rounded-xl gap-2 gradient-primary shadow-lg shadow-primary-500/20">
          <Save className="h-4 w-4" />
          حفظ جميع التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" dir="rtl">
        {/* Sidebar Tabs (Simulated) */}
        <div className="lg:col-span-1 space-y-2">
            {[
                { id: 'general', label: 'الإعدادات العامة', icon: Globe, active: true },
                { id: 'payment', label: 'بوابة الدفع', icon: CreditCard, active: false },
                { id: 'whatsapp', label: 'خدمة الواتساب', icon: MessageCircle, active: false },
                { id: 'security', label: 'الأمان والوصول', icon: Shield, active: false },
                { id: 'notifications', label: 'التنبيهات', icon: Bell, active: false },
            ].map((tab) => (
                <button
                    key={tab.id}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                        tab.active 
                            ? "bg-white text-primary-600 shadow-sm border border-surface-100" 
                            : "text-surface-500 hover:text-surface-900 hover:bg-surface-100/50"
                    )}
                >
                    <tab.icon className={cn("h-5 w-5", tab.active ? "text-primary-600" : "text-surface-400")} />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
            {/* General Settings Card */}
            <div className="bg-white rounded-3xl border border-surface-100 shadow-sm p-8">
                <h3 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary-600" />
                    الهوية والروابط الأساسية
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">اسم المتجر (العربية)</label>
                        <Input defaultValue={settings['store_name_ar'] || 'دوحة بلس'} className="rounded-xl bg-surface-50/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">اسم المتجر (English)</label>
                        <Input defaultValue={settings['store_name_en'] || 'Doha Plus'} className="rounded-xl bg-surface-50/50" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">وصف المتجر (Meta Description)</label>
                        <Textarea 
                            defaultValue={settings['store_description'] || 'متجر دوحة بلس لبيع أكواد التفعيل والاشتراكات والمنتجات الرقمية.'} 
                            className="rounded-xl bg-surface-50/50 min-h-[100px]" 
                        />
                    </div>
                </div>
            </div>

            {/* Payment Settings Card */}
            <div className="bg-white rounded-3xl border border-surface-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        بوابة الدفع (MyFatoorah)
                    </h3>
                    <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter border border-emerald-100">Active</div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                            تأكد من استخدام <strong>Production API Token</strong> للعمليات الحقيقية. استخدام مفتاح الاختبار سيمنع العملاء من إتمام الدفع بنجاح.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">API Token</label>
                        <Input type="password" value="••••••••••••••••••••••••••••••••" className="rounded-xl bg-surface-50/50 font-mono" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">العملة الافتراضية</label>
                            <Input defaultValue="KWD" className="rounded-xl bg-surface-50/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">البلد (ISO)</label>
                            <Input defaultValue="KWT" className="rounded-xl bg-surface-50/50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Settings Card */}
            <div className="bg-white rounded-3xl border border-surface-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        إرسال المفاتيح عبر الواتساب
                    </h3>
                    <div className="px-3 py-1 rounded-full bg-surface-50 text-surface-400 text-[10px] font-black uppercase tracking-tighter border border-surface-100">Disabled</div>
                </div>

                <div className="space-y-6 opacity-50 grayscale pointer-events-none">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">WhatsApp Phone Number ID</label>
                        <Input placeholder="رقم المعرف من Meta Dashboard" className="rounded-xl bg-surface-50/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">System Auth Token</label>
                        <Input type="password" placeholder="••••••••••••" className="rounded-xl bg-surface-50/50" />
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
