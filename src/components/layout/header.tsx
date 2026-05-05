'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { Container } from '@/components/layout/container';
import { cn } from '@/lib/utils';
import { Menu, X, ShoppingBag } from 'lucide-react';
import type { Locale } from '@/lib/constants';

interface HeaderProps {
  locale: Locale;
}

type NavItem = {
  href: string;
  labelKey: string;
  external?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/products', labelKey: 'products' },
  { href: '/apps', labelKey: 'apps' },
  { href: '/orders', labelKey: 'orders' },
  { href: 'https://api.whatsapp.com/send/?phone=97466937442', labelKey: 'support', external: true },
];

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const isAr = locale === 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 start-0 end-0 z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-surface-200 shadow-sm py-2'
          : 'bg-white border-transparent py-4',
      )}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {/* TODO: Upload Logo to Supabase Storage -> 'brand' bucket and replace this placeholder with <Image src={logoUrl} /> */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">D+</span>
            </div>
            <span className="font-extrabold text-xl text-surface-900 tracking-tight">
              {isAr ? 'دوحة بلس' : 'Doha Plus'}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = !item.external && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all text-surface-600 hover:text-surface-900 hover:bg-surface-50"
                  >
                    {t(item.labelKey as Parameters<typeof t>[0])}
                  </a>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-surface-100 text-surface-900'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50',
                  )}
                >
                  {t(item.labelKey as Parameters<typeof t>[0])}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">

            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              {isAr ? 'شراء كود' : 'Buy Code'}
            </Link>

            <Link
              href={pathname}
              locale={otherLocale}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold text-surface-600 bg-surface-100 hover:bg-surface-200 transition-colors"
              title={isAr ? 'English' : 'عربي'}
            >
              {isAr ? 'EN' : 'ع'}
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-surface-100 mt-4 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = !item.external && pathname === item.href;
                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-base font-semibold text-surface-700 hover:bg-surface-50"
                    >
                      {t(item.labelKey)}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'px-4 py-3 rounded-xl text-base font-semibold transition-colors',
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-700 hover:bg-surface-50',
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}

              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-primary-600 text-white font-bold shadow-md hover:bg-primary-700 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {isAr ? 'شراء كود تفعيل' : 'Buy Activation Code'}
              </Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
