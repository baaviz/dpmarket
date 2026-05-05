// ---------------------------------------------------------------------------
// Shared TypeScript types for the application.
// These are safe types that can be used on both client and server.
// Never include sensitive fields (encrypted codes, tokens, etc.) here.
// ---------------------------------------------------------------------------

import type { Locale } from '@/lib/constants';

/** Bilingual text stored as JSONB { ar, en } */
export interface BilingualText {
  ar: string;
  en: string;
}

/** Get the correct text for a locale */
export function getLocalizedText(text: BilingualText | null | undefined, locale: Locale): string {
  if (!text) return '';
  return text[locale] || text.ar || text.en || '';
}

// ---------------------------------------------------------------------------
// Product DTOs (safe for client)
// ---------------------------------------------------------------------------

export interface ProductCategoryDTO {
  id: string;
  slug: string;
  name: BilingualText;
  description: BilingualText | null;
  sort_order: number;
}

export interface ProductImageDTO {
  id: string;
  storage_path: string;
  url: string;
  alt: BilingualText | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariantDTO {
  id: string;
  name: BilingualText;
  sku: string;
  price: number;
  currency: string;
  is_active: boolean;
  in_stock: boolean; // derived, never expose count
}

export interface ProductDTO {
  id: string;
  slug: string;
  type: string;
  name: BilingualText;
  short_description: BilingualText | null;
  description: BilingualText | null;
  price: number;
  currency: string;
  compare_at_price: number | null;
  is_featured: boolean;
  requires_mobile: boolean;
  delivery_type: string;
  category: ProductCategoryDTO | null;
  images: ProductImageDTO[];
  variants: ProductVariantDTO[];
  in_stock: boolean; // derived, never expose count
  public_metadata: Record<string, unknown> | null;
  seo: {
    title?: BilingualText;
    description?: BilingualText;
    keywords?: string[];
  } | null;
}

export interface ProductListItemDTO {
  id: string;
  slug: string;
  type: string;
  name: BilingualText;
  short_description: BilingualText | null;
  price: number;
  currency: string;
  compare_at_price: number | null;
  is_featured: boolean;
  primary_image: ProductImageDTO | null;
  category: ProductCategoryDTO | null;
  in_stock: boolean;
}

// ---------------------------------------------------------------------------
// Order DTOs (safe for client with access token)
// ---------------------------------------------------------------------------

export interface OrderItemDTO {
  id: string;
  product_name_snapshot: BilingualText;
  unit_price: number;
  quantity: number;
  total_price: number;
  fulfillment_status: string;
  delivered_at: string | null;
}

export interface OrderDTO {
  id: string;
  public_order_number: string;
  status: string;
  payment_status: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  items: OrderItemDTO[];
  created_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
}

/** Extended order with delivered code — only shown on success page with valid access */
export interface OrderWithDeliveryDTO extends OrderDTO {
  delivered_codes: Array<{
    item_id: string;
    product_name: BilingualText;
    code: string; // decrypted code, only after verified payment
  }>;
  whatsapp_status: string | null;
}

export interface OrderListItemDTO {
  id: string;
  public_order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  product_name: BilingualText;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Apps Catalog (safe for client)
// ---------------------------------------------------------------------------

export interface AppCatalogItemDTO {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  category: string | null;
  description: BilingualText | null;
  source_url: string | null;
}

// ---------------------------------------------------------------------------
// Settings (public only)
// ---------------------------------------------------------------------------

export interface PublicSettingsDTO {
  site_name?: BilingualText;
  site_description?: BilingualText;
  contact_email?: string;
  contact_phone?: string;
  social_links?: Record<string, string>;
  faq?: Array<{ question: BilingualText; answer: BilingualText }>;
  homepage_sections?: Record<string, boolean>;
  support_url?: string;
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface CheckoutResponse {
  payment_url: string;
  order_number: string;
}

export interface PaymentStatusResponse {
  status: string;
  order_number: string;
  redirect_url?: string;
}
