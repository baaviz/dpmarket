// ---------------------------------------------------------------------------
// Doha Plus Apps — Real data parsed from https://doha-plus.com/Apps
// This file contains the genuine app catalog. It is the source of truth
// until admin-managed apps are added to the database.
// ---------------------------------------------------------------------------

export interface DohaApp {
  name: string;
  description: string;
  category: 'social' | 'gaming' | 'tools' | 'media' | 'education' | 'vpn' | 'productivity' | 'kids' | 'sports' | 'other';
  requiresCode: boolean;
  sourceUrl: string;
  icon_url?: string;
}

/**
 * The top featured apps from doha-plus.com/Apps.
 * These are the primary / hero apps that represent key product lines.
 */
export const FEATURED_APPS: DohaApp[] = [
  {
    name: '8 Ball Pool Hack (Wizard)',
    description: 'نسخة مدفوعة من هاك البلياردو Wizard — خطوط، إخفاء ESP، توقع الهدف، سرعة الهدف، حماية قوية جداً.',
    category: 'gaming',
    requiresCode: true,
    sourceUrl: 'https://doha-plus.com/Apps',
    icon_url: 'https://doha-plus.com/images/1198729678685a8268026e8/AppIcon@2x.png'
  },
  {
    name: 'Snapchat Zero',
    description: 'سناب بلس مدفوع — حفظ السنابات والدردشة، مشاهدة بوضع التخفي، الموقع الوهمي، إزالة الإعلانات، والمزيد.',
    category: 'social',
    requiresCode: true,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Snapchat Root',
    description: 'نسخة سناب متقدمة — تخطي حظر IP، ابقاء الرسائل المحذوفة، تغيير الموقع، اشتراك سناب بلس كامل.',
    category: 'social',
    requiresCode: true,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'SAT WhatsApp',
    description: 'واتساب معدّل — إخفاء الظهور، تعطيل القراءة، حفظ الحالات، تغيير الموقع، إرسال وسائط غير محدود.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
    icon_url: 'https://ipa.ameer.app/storage/A43BE4FB4ADC9EBSQP/121281/512x512bb.jpg'
  },
  {
    name: 'SAT Business',
    description: 'واتساب بزنس معدّل — إخفاء المتصل الآن، حفظ الحالات، حظر المكالمات، إرسال HD دائماً.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'SAT Instagram',
    description: 'إنستقرام معدّل — حفظ الصور والفيديو، التخفي في البث المباشر والستوري، تعطيل الإعلانات.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'SAT X',
    description: 'تويتر معدّل — تنزيل الفيديوهات، تعطيل الإعلانات، تأكيد الإعجاب والمتابعة، قفل بالبصمة.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'SAT Locket',
    description: 'لوكيت معدّل — تفعيل Gold، تغيير الموقع، تعطيل الإعلانات، الرفع من الاستوديو.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'SAT Jodel',
    description: 'يودل معدّل — حفظ الصور، تغيير الموقع، وضع التخفي، إزالة الإعلانات، تفعيل يودل بلس.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'DLTube',
    description: 'يوتيوب معدّل — تنزيل الفيديوهات بجودات متعددة، إزالة الإعلانات، التشغيل في الخلفية.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'DLInsta',
    description: 'إنستقرام — تنزيل الصور والفيديوهات والريلز، مشاهدة الستوري بتخفي، إزالة الإعلانات.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'BH X',
    description: 'تويتر معدّل — تحميل الفيديوهات، إزالة الإعلانات، ملاحظة صوتية بالتغريدة، التراجع عن التغريد.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'DL X',
    description: 'تويتر — تنزيل الفيديوهات بجودات مختلفة، إزالة الإعلانات، قفل بالبصمة.',
    category: 'social',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'DohaFlix',
    description: 'لمشاهدة جميع الأفلام والمسلسلات — Made with ❤️ by DohaPlusTeam.',
    category: 'media',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Clash of Clans',
    description: 'سيرفر خاص — جواهر لا نهائية، عملات لا نهائية، موارد لا نهائية، لعبة متعددة اللاعبين.',
    category: 'gaming',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Duolingo',
    description: 'دولينقو مفتوح المميزات.',
    category: 'education',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Notability',
    description: 'أفضل تطبيق لتدوين الملاحظات — مع كامل المميزات. يدعم iOS 17 وفوق.',
    category: 'productivity',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'PDF Expert',
    description: 'أفضل تطبيق لتحرير مستندات وملفات الـ PDF — مفتوح المميزات.',
    category: 'productivity',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Lightroom',
    description: 'تطبيق Lightroom iPad للتعديل على الصور — مع كامل المزايا.',
    category: 'productivity',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Gaming VPN',
    description: 'VPN — في بي ان — تطبيق مفتوح المزايا.',
    category: 'vpn',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'VPN-Z',
    description: 'VPN — في بي ان — تطبيق مفتوح المزايا.',
    category: 'vpn',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'نمبربوك الخليج',
    description: 'الاشتراك مفعل — بدون إعلانات.',
    category: 'tools',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Wallcraft',
    description: 'تطبيق لتحميل الخلفيات بجودة عالية — تفعيل البريميوم بشكل كامل.',
    category: 'tools',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
  {
    name: 'Bazaart',
    description: 'تطبيق Bazaart لتعديل على الصور والفيديوهات — مفتوح كامل المزايا نسخة Premium.',
    category: 'productivity',
    requiresCode: false,
    sourceUrl: 'https://doha-plus.com/Apps',
  },
];

/** Total apps count from the source (approx) */
export const TOTAL_APPS_COUNT = 180;

/** Category labels */
export const APP_CATEGORIES: Record<DohaApp['category'], { ar: string; en: string }> = {
  social: { ar: 'تطبيقات اجتماعية', en: 'Social Apps' },
  gaming: { ar: 'ألعاب', en: 'Games' },
  tools: { ar: 'أدوات', en: 'Tools' },
  media: { ar: 'وسائط وترفيه', en: 'Media & Entertainment' },
  education: { ar: 'تعليم', en: 'Education' },
  vpn: { ar: 'VPN', en: 'VPN' },
  productivity: { ar: 'إنتاجية', en: 'Productivity' },
  kids: { ar: 'أطفال', en: 'Kids' },
  sports: { ar: 'رياضة', en: 'Sports' },
  other: { ar: 'أخرى', en: 'Other' },
};
