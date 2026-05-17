import '@/styles/globals.css';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import type { Locale } from '@/lib/constants';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { getPublicSettingsMapCached } from '@/lib/server/public-dal/settings';

// Self-hosted fonts via next/font — eliminates render-blocking Google Fonts CSS
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-arabic',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: {
    default: 'دوحة بلس | Doha Plus - أكواد التفعيل والمنتجات الرقمية',
    template: '%s | دوحة بلس',
  },
  description: 'متجر دوحة بلس لبيع أكواد التفعيل والاشتراكات والمنتجات الرقمية. دفع آمن وتوصيل فوري.',
  keywords: ['أكواد تفعيل', 'اشتراكات رقمية', 'دوحة بلس', 'Doha Plus', 'digital products', 'activation codes'],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'دوحة بلس | Doha Plus',
    description: 'متجر دوحة بلس لبيع أكواد التفعيل والاشتراكات والمنتجات الرقمية. دفع آمن وتوصيل فوري.',
    type: 'website',
    locale: 'ar_QA',
    alternateLocale: 'en_US',
    siteName: 'Doha Plus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دوحة بلس | Doha Plus',
    description: 'متجر أكواد التفعيل والمنتجات الرقمية',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const settings = await getPublicSettingsMapCached();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${ibmPlexArabic.variable} ${inter.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7e3bed" />
        {/* Preconnect to Supabase for fast API calls */}
        <link rel="preconnect" href="https://huelxvjqsuoosnmikqyn.supabase.co" />
        <link rel="dns-prefetch" href="https://huelxvjqsuoosnmikqyn.supabase.co" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-surface-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} settings={settings} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale as Locale} settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
