// ---------------------------------------------------------------------------
// Application Constants
// ---------------------------------------------------------------------------

export const APP_NAME = 'Doha Plus';
export const APP_NAME_AR = 'دوحة بلس';

export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ar';

export const CURRENCIES = {
  QAR: { code: 'QAR', symbol: 'ر.ق', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', decimals: 2 },
  KWD: { code: 'KWD', symbol: 'د.ك', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', decimals: 3 },
  SAR: { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', decimals: 2 },
  USD: { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', decimals: 2 },
} as const;

export const ORDER_NUMBER_PREFIX = 'DP';

export const GUEST_COOKIE_NAME = 'dp_guest_token';
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const PRODUCT_TYPES = ['activation_code', 'digital_product', 'subscription', 'service'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const DELIVERY_TYPES = ['code', 'file', 'manual', 'external_instructions'] as const;
export type DeliveryType = (typeof DELIVERY_TYPES)[number];

export const ORDER_STATUSES = [
  'draft',
  'pending_payment',
  'paid',
  'payment_failed',
  'fulfilled',
  'partially_fulfilled',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'none',
  'initiated',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'expired',
  'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_STATUSES = ['pending', 'fulfilled', 'failed', 'manual_required'] as const;
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const ADMIN_ROLES = ['owner', 'admin', 'support', 'analyst'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const STOCK_STRATEGIES = ['finite_codes', 'unlimited_manual', 'external'] as const;
export type StockStrategy = (typeof STOCK_STRATEGIES)[number];

export const ANALYTICS_EVENT_TYPES = [
  'page_view',
  'product_view',
  'checkout_started',
  'payment_redirected',
  'payment_success',
  'payment_failed',
  'code_delivered',
  'whatsapp_queued',
  'whatsapp_sent',
] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const AUDIT_ACTOR_TYPES = ['admin', 'system', 'customer', 'webhook'] as const;
export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];
