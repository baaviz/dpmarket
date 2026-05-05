-- Migration 009: Performance Indexes
-- Adding B-Tree and GIN indexes to improve query performance for public and admin pages.

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_public ON public.products (is_active, is_featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);

-- Apps catalog indexes
CREATE INDEX IF NOT EXISTS idx_apps_catalog_public_sort ON public.apps_catalog (is_active, sort_order, name);
CREATE INDEX IF NOT EXISTS idx_apps_catalog_featured ON public.apps_catalog (is_active, is_featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_apps_catalog_category ON public.apps_catalog (is_active, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_apps_catalog_slug ON public.apps_catalog (slug);
CREATE INDEX IF NOT EXISTS idx_apps_catalog_updated ON public.apps_catalog (is_active, last_updated_at DESC);

-- Settings index
CREATE INDEX IF NOT EXISTS idx_settings_public ON public.settings (is_public, key);

-- Full-text search index for Apps
ALTER TABLE public.apps_catalog
ADD COLUMN IF NOT EXISTS search_text text GENERATED ALWAYS AS (
  lower(coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(description::text, ''))
) STORED;

CREATE INDEX IF NOT EXISTS idx_apps_catalog_search_text ON public.apps_catalog USING gin (to_tsvector('simple', search_text));

-- Orders index (for admin and guest queries)
CREATE INDEX IF NOT EXISTS idx_orders_guest ON public.orders (guest_session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status, created_at DESC);
