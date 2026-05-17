import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Shield, Zap, Headphones, UserX } from 'lucide-react';

const features = [
  { icon: Shield, titleKey: 'feature1Title' as const, descKey: 'feature1Desc' as const, accent: 'text-primary-600', bg: 'bg-primary-50' },
  { icon: Zap, titleKey: 'feature2Title' as const, descKey: 'feature2Desc' as const, accent: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Headphones, titleKey: 'feature3Title' as const, descKey: 'feature3Desc' as const, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: UserX, titleKey: 'feature4Title' as const, descKey: 'feature4Desc' as const, accent: 'text-blue-600', bg: 'bg-blue-50' },
];

export async function FeaturesSection({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <Section className="py-20 md:py-28">
      <Container>
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('whyUs')}</h2>
          <p className="mt-3 text-surface-500 text-base">{t('whyUsDesc')}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, titleKey, descKey, accent, bg }) => (
            <div
              key={titleKey}
              className="group p-6 rounded-2xl border border-surface-100 hover:border-surface-200 transition-all duration-200 hover:shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${accent}`} />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{t(titleKey)}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
