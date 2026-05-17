import type { BilingualText } from '@/types';
import type { Locale } from '@/lib/constants';
import { CURRENCIES } from '@/lib/constants';

export const SUPPORT_WHATSAPP_NUMBER = '97466937442';
export const SUPPORT_WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${SUPPORT_WHATSAPP_NUMBER}`;

type MaybeLocalized = BilingualText | string | null | undefined;

export function getLocalizedText(value: MaybeLocalized, locale: string, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value || fallback;

  const currentLocale = locale === 'en' ? 'en' : 'ar';
  return value[currentLocale] || value.ar || value.en || fallback;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
  locale: string,
) {
  const numericAmount = Number(amount || 0);
  const currencyCode = (currency || 'QAR').toUpperCase();
  const knownCurrency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  const symbol = knownCurrency
    ? locale === 'ar'
      ? knownCurrency.symbol
      : knownCurrency.code
    : currencyCode;

  const value = Number.isInteger(numericAmount)
    ? numericAmount.toString()
    : numericAmount.toFixed(2).replace(/\.?0+$/, '');

  return `${value} ${symbol}`;
}

export function getCurrencyLabel(currency: string | null | undefined, locale: Locale | string) {
  const currencyCode = (currency || 'QAR').toUpperCase();
  const knownCurrency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  if (!knownCurrency) return currencyCode;
  return locale === 'ar' ? knownCurrency.symbol : knownCurrency.code;
}

export function normalizeSearchParam(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'D+';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
