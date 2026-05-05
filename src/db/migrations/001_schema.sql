-- ============================================================================
-- Doha Plus Market — Database Migration 001: Schema Foundation
-- ============================================================================
-- Run this in your Supabase SQL Editor or via Supabase CLI.
-- This migration creates all enums, tables, indexes, functions, and triggers.
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM ENUMS
-- ============================================================================

CREATE TYPE admin_role AS ENUM ('owner', 'admin', 'support', 'analyst');
CREATE TYPE product_type AS ENUM ('activation_code', 'digital_product', 'subscription', 'service');
CREATE TYPE delivery_type AS ENUM ('code', 'file', 'manual', 'external_instructions');
CREATE TYPE stock_strategy AS ENUM ('finite_codes', 'unlimited_manual', 'external');
CREATE TYPE inventory_code_status AS ENUM ('available', 'reserved', 'sold', 'disabled');
CREATE TYPE order_status AS ENUM ('draft', 'pending_payment', 'paid', 'payment_failed', 'fulfilled', 'partially_fulfilled', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('none', 'initiated', 'pending', 'paid', 'failed', 'cancelled', 'expired', 'refunded');
CREATE TYPE fulfillment_status AS ENUM ('pending', 'fulfilled', 'failed', 'manual_required');
CREATE TYPE payment_provider AS ENUM ('myfatoorah');
CREATE TYPE payment_attempt_status AS ENUM ('initiated', 'redirected', 'pending', 'paid', 'failed', 'cancelled', 'expired');
CREATE TYPE whatsapp_message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'provider_not_configured');
CREATE TYPE analytics_event_type AS ENUM ('page_view', 'product_view', 'checkout_started', 'payment_redirected', 'payment_success', 'payment_failed', 'code_delivered', 'whatsapp_queued', 'whatsapp_sent');
CREATE TYPE audit_actor_type AS ENUM ('admin', 'system', 'customer', 'webhook');

-- ============================================================================
-- 2. HELPER FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate readable order number: DP-YYYYMMDD-XXXXXX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  random_part TEXT;
  result TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
  result := 'DP-' || date_part || '-' || random_part;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Audit log helper
CREATE OR REPLACE FUNCTION log_audit(
  p_actor_type audit_actor_type,
  p_actor_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_ua_hash TEXT DEFAULT NULL,
  p_before JSONB DEFAULT NULL,
  p_after JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO audit_logs (actor_type, actor_id, action, entity_type, entity_id, ip_hash, user_agent_hash, before, after, metadata)
  VALUES (p_actor_type, p_actor_id, p_action, p_entity_type, p_entity_id, p_ip_hash, p_ua_hash, p_before, p_after, p_metadata)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- 3.1 Admin Profiles
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'admin',
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tr_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.2 Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES admin_profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tr_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.3 Product Categories
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL DEFAULT '{"ar": "", "en": ""}',
  description JSONB DEFAULT '{"ar": "", "en": ""}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_active ON product_categories(is_active) WHERE is_active = TRUE;

CREATE TRIGGER tr_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.4 Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  type product_type NOT NULL DEFAULT 'activation_code',
  name JSONB NOT NULL DEFAULT '{"ar": "", "en": ""}',
  short_description JSONB DEFAULT '{"ar": "", "en": ""}',
  description JSONB DEFAULT '{"ar": "", "en": ""}',
  price NUMERIC(12, 3) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'KWD',
  compare_at_price NUMERIC(12, 3) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  requires_mobile BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_type delivery_type NOT NULL DEFAULT 'code',
  public_metadata JSONB DEFAULT '{}',
  private_metadata JSONB DEFAULT '{}',
  seo JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE AND is_active = TRUE;
CREATE INDEX idx_products_type ON products(type);

CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.5 Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt JSONB DEFAULT '{"ar": "", "en": ""}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- 3.6 Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name JSONB NOT NULL DEFAULT '{"ar": "", "en": ""}',
  sku TEXT UNIQUE NOT NULL,
  price NUMERIC(12, 3) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'KWD',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  stock_strategy stock_strategy NOT NULL DEFAULT 'finite_codes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

CREATE TRIGGER tr_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.7 Inventory Batches
CREATE TABLE inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  available_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_batches_product ON inventory_batches(product_id);

-- 3.8 Inventory Codes
CREATE TABLE inventory_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  encrypted_code TEXT NOT NULL,
  code_hash TEXT UNIQUE NOT NULL,
  status inventory_code_status NOT NULL DEFAULT 'available',
  reserved_order_item_id UUID,
  sold_order_item_id UUID,
  reserved_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  batch_id UUID REFERENCES inventory_batches(id) ON DELETE SET NULL,
  created_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_codes_product ON inventory_codes(product_id);
CREATE INDEX idx_inventory_codes_variant ON inventory_codes(variant_id);
CREATE INDEX idx_inventory_codes_status ON inventory_codes(status);
CREATE INDEX idx_inventory_codes_available ON inventory_codes(product_id, variant_id, status) WHERE status = 'available';
CREATE INDEX idx_inventory_codes_hash ON inventory_codes(code_hash);

CREATE TRIGGER tr_inventory_codes_updated_at
  BEFORE UPDATE ON inventory_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.9 Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_country_code TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  mobile_e164 TEXT UNIQUE,
  display_name TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_customers_mobile ON customers(mobile_e164);

-- 3.10 Guest Sessions
CREATE TABLE guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  guest_token_hash TEXT UNIQUE NOT NULL,
  first_seen_ip_hash TEXT,
  user_agent_hash TEXT,
  device_fingerprint_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year')
);

CREATE INDEX idx_guest_sessions_token ON guest_sessions(guest_token_hash);
CREATE INDEX idx_guest_sessions_customer ON guest_sessions(customer_id);

-- 3.11 Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_order_number TEXT UNIQUE NOT NULL DEFAULT generate_order_number(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  guest_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'draft',
  payment_status payment_status NOT NULL DEFAULT 'none',
  subtotal_amount NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
  discount_amount NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'KWD',
  customer_mobile_e164 TEXT NOT NULL,
  customer_ip_hash TEXT,
  customer_user_agent_hash TEXT,
  customer_country TEXT,
  customer_city TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  access_token_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_guest_session ON orders(guest_session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(public_order_number);
CREATE INDEX idx_orders_access_token ON orders(access_token_hash);
CREATE INDEX idx_orders_mobile ON orders(customer_mobile_e164);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.12 Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name_snapshot JSONB NOT NULL DEFAULT '{"ar": "", "en": ""}',
  unit_price NUMERIC(12, 3) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price NUMERIC(12, 3) NOT NULL CHECK (total_price >= 0),
  fulfillment_status fulfillment_status NOT NULL DEFAULT 'pending',
  delivered_payload_encrypted TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Add FK from inventory_codes to order_items (now that order_items exists)
ALTER TABLE inventory_codes
  ADD CONSTRAINT fk_inventory_reserved_order_item
  FOREIGN KEY (reserved_order_item_id) REFERENCES order_items(id) ON DELETE SET NULL;

ALTER TABLE inventory_codes
  ADD CONSTRAINT fk_inventory_sold_order_item
  FOREIGN KEY (sold_order_item_id) REFERENCES order_items(id) ON DELETE SET NULL;

-- 3.13 Payment Attempts
CREATE TABLE payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL DEFAULT 'myfatoorah',
  status payment_attempt_status NOT NULL DEFAULT 'initiated',
  provider_invoice_id TEXT,
  provider_payment_id TEXT,
  provider_customer_reference TEXT,
  provider_response JSONB DEFAULT '{}',
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_attempts_order ON payment_attempts(order_id);
CREATE INDEX idx_payment_attempts_provider_invoice ON payment_attempts(provider_invoice_id);
CREATE INDEX idx_payment_attempts_status ON payment_attempts(status);

CREATE TRIGGER tr_payment_attempts_updated_at
  BEFORE UPDATE ON payment_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.14 Payment Webhook Events
CREATE TABLE payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider payment_provider NOT NULL DEFAULT 'myfatoorah',
  event_reference TEXT UNIQUE,
  event_name TEXT NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_reference ON payment_webhook_events(event_reference);
CREATE INDEX idx_webhook_events_created ON payment_webhook_events(created_at DESC);

-- 3.15 WhatsApp Messages
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'cloud_api',
  to_mobile_e164 TEXT NOT NULL,
  template_name TEXT,
  status whatsapp_message_status NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  payload JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_whatsapp_messages_order ON whatsapp_messages(order_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);

-- 3.16 Apps Catalog
CREATE TABLE apps_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  category TEXT,
  description JSONB DEFAULT '{"ar": "", "en": ""}',
  source_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_apps_catalog_slug ON apps_catalog(slug);
CREATE INDEX idx_apps_catalog_active ON apps_catalog(is_active) WHERE is_active = TRUE;

CREATE TRIGGER tr_apps_catalog_updated_at
  BEFORE UPDATE ON apps_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.17 Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type analytics_event_type NOT NULL,
  anonymous_id TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  guest_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_product ON analytics_events(product_id) WHERE product_id IS NOT NULL;

-- 3.18 Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type audit_actor_type NOT NULL,
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  ip_hash TEXT,
  user_agent_hash TEXT,
  before JSONB,
  after JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- 4. INVENTORY CLAIMING FUNCTION (Transaction-safe)
-- ============================================================================

CREATE OR REPLACE FUNCTION claim_inventory_code(
  p_product_id UUID,
  p_variant_id UUID,
  p_order_item_id UUID
)
RETURNS TABLE (
  code_id UUID,
  encrypted_code TEXT
) AS $$
DECLARE
  v_code_id UUID;
  v_encrypted_code TEXT;
BEGIN
  -- Lock and claim the first available code
  -- FOR UPDATE SKIP LOCKED prevents race conditions
  SELECT ic.id, ic.encrypted_code
  INTO v_code_id, v_encrypted_code
  FROM inventory_codes ic
  WHERE ic.product_id = p_product_id
    AND (p_variant_id IS NULL OR ic.variant_id = p_variant_id)
    AND ic.status = 'available'
    AND (ic.expires_at IS NULL OR ic.expires_at > NOW())
  ORDER BY ic.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_code_id IS NULL THEN
    RETURN; -- No available codes
  END IF;

  -- Mark as sold
  UPDATE inventory_codes
  SET status = 'sold',
      sold_order_item_id = p_order_item_id,
      sold_at = NOW(),
      updated_at = NOW()
  WHERE id = v_code_id;

  -- Update batch available count
  UPDATE inventory_batches ib
  SET available_count = available_count - 1
  WHERE ib.id = (SELECT batch_id FROM inventory_codes WHERE id = v_code_id)
    AND ib.available_count > 0;

  RETURN QUERY SELECT v_code_id, v_encrypted_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
