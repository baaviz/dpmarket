-- ============================================================================
-- Doha Plus Market — RLS Policies
-- ============================================================================
-- Run AFTER 001_schema.sql
-- Uses security definer functions to avoid recursive RLS on admin_profiles.
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY DEFINER helper functions (avoid recursive RLS on admin_profiles)
-- ============================================================================

-- Check if current auth user is an active admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current auth user is an owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
      AND is_active = TRUE
      AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current admin's role
CREATE OR REPLACE FUNCTION current_admin_role()
RETURNS admin_role AS $$
DECLARE
  v_role admin_role;
BEGIN
  SELECT role INTO v_role FROM admin_profiles
  WHERE id = auth.uid() AND is_active = TRUE;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- POLICIES: admin_profiles
-- ============================================================================

-- Admins can view their own profile
CREATE POLICY admin_profiles_select_own ON admin_profiles
  FOR SELECT USING (id = auth.uid());

-- Owners can view all admin profiles
CREATE POLICY admin_profiles_select_all ON admin_profiles
  FOR SELECT USING (is_owner());

-- Owners can manage admin profiles
CREATE POLICY admin_profiles_insert ON admin_profiles
  FOR INSERT WITH CHECK (is_owner());

CREATE POLICY admin_profiles_update ON admin_profiles
  FOR UPDATE USING (is_owner());

CREATE POLICY admin_profiles_delete ON admin_profiles
  FOR DELETE USING (is_owner());

-- ============================================================================
-- POLICIES: settings
-- ============================================================================

-- Public can read public settings
CREATE POLICY settings_select_public ON settings
  FOR SELECT USING (is_public = TRUE);

-- Admins can read all settings
CREATE POLICY settings_select_admin ON settings
  FOR SELECT USING (is_admin());

-- Owner/admin can manage settings
CREATE POLICY settings_insert ON settings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY settings_update ON settings
  FOR UPDATE USING (is_admin());

CREATE POLICY settings_delete ON settings
  FOR DELETE USING (is_owner());

-- ============================================================================
-- POLICIES: product_categories (public read for active, admin full)
-- ============================================================================

CREATE POLICY product_categories_select_public ON product_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY product_categories_select_admin ON product_categories
  FOR SELECT USING (is_admin());

CREATE POLICY product_categories_insert ON product_categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY product_categories_update ON product_categories
  FOR UPDATE USING (is_admin());

CREATE POLICY product_categories_delete ON product_categories
  FOR DELETE USING (is_admin());

-- ============================================================================
-- POLICIES: products (public read for active, admin full)
-- IMPORTANT: private_metadata is column-level, not row-level.
-- The anon client should only query safe columns. Service role bypasses RLS.
-- ============================================================================

CREATE POLICY products_select_public ON products
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY products_select_admin ON products
  FOR SELECT USING (is_admin());

CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY products_update ON products
  FOR UPDATE USING (is_admin());

CREATE POLICY products_delete ON products
  FOR DELETE USING (is_admin());

-- ============================================================================
-- POLICIES: product_images (public read, admin manage)
-- ============================================================================

CREATE POLICY product_images_select_public ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.is_active = TRUE)
  );

CREATE POLICY product_images_select_admin ON product_images
  FOR SELECT USING (is_admin());

CREATE POLICY product_images_insert ON product_images
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY product_images_update ON product_images
  FOR UPDATE USING (is_admin());

CREATE POLICY product_images_delete ON product_images
  FOR DELETE USING (is_admin());

-- ============================================================================
-- POLICIES: product_variants (public read active, admin full)
-- ============================================================================

CREATE POLICY product_variants_select_public ON product_variants
  FOR SELECT USING (
    is_active = TRUE AND
    EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.is_active = TRUE)
  );

CREATE POLICY product_variants_select_admin ON product_variants
  FOR SELECT USING (is_admin());

CREATE POLICY product_variants_insert ON product_variants
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY product_variants_update ON product_variants
  FOR UPDATE USING (is_admin());

CREATE POLICY product_variants_delete ON product_variants
  FOR DELETE USING (is_admin());

-- ============================================================================
-- POLICIES: inventory_codes (ADMIN ONLY — never public)
-- ============================================================================

CREATE POLICY inventory_codes_select ON inventory_codes
  FOR SELECT USING (is_admin());

CREATE POLICY inventory_codes_insert ON inventory_codes
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY inventory_codes_update ON inventory_codes
  FOR UPDATE USING (is_admin());

CREATE POLICY inventory_codes_delete ON inventory_codes
  FOR DELETE USING (is_owner());

-- ============================================================================
-- POLICIES: inventory_batches (admin only)
-- ============================================================================

CREATE POLICY inventory_batches_select ON inventory_batches
  FOR SELECT USING (is_admin());

CREATE POLICY inventory_batches_insert ON inventory_batches
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY inventory_batches_update ON inventory_batches
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: customers (admin only — accessed via service role for orders)
-- ============================================================================

CREATE POLICY customers_select ON customers
  FOR SELECT USING (is_admin());

CREATE POLICY customers_insert ON customers
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY customers_update ON customers
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: guest_sessions (no public access)
-- ============================================================================

CREATE POLICY guest_sessions_select ON guest_sessions
  FOR SELECT USING (is_admin());

CREATE POLICY guest_sessions_insert ON guest_sessions
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY guest_sessions_update ON guest_sessions
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: orders (admin only — guest access via service role)
-- ============================================================================

CREATE POLICY orders_select ON orders
  FOR SELECT USING (is_admin());

CREATE POLICY orders_insert ON orders
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY orders_update ON orders
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: order_items (admin only)
-- ============================================================================

CREATE POLICY order_items_select ON order_items
  FOR SELECT USING (is_admin());

CREATE POLICY order_items_insert ON order_items
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY order_items_update ON order_items
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: payment_attempts (admin only)
-- ============================================================================

CREATE POLICY payment_attempts_select ON payment_attempts
  FOR SELECT USING (is_admin());

CREATE POLICY payment_attempts_insert ON payment_attempts
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY payment_attempts_update ON payment_attempts
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: payment_webhook_events (admin only)
-- ============================================================================

CREATE POLICY webhook_events_select ON payment_webhook_events
  FOR SELECT USING (is_admin());

CREATE POLICY webhook_events_insert ON payment_webhook_events
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY webhook_events_update ON payment_webhook_events
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: whatsapp_messages (admin only)
-- ============================================================================

CREATE POLICY whatsapp_messages_select ON whatsapp_messages
  FOR SELECT USING (is_admin());

CREATE POLICY whatsapp_messages_insert ON whatsapp_messages
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY whatsapp_messages_update ON whatsapp_messages
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- POLICIES: apps_catalog (public read active, admin full)
-- ============================================================================

CREATE POLICY apps_catalog_select_public ON apps_catalog
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY apps_catalog_select_admin ON apps_catalog
  FOR SELECT USING (is_admin());

CREATE POLICY apps_catalog_insert ON apps_catalog
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY apps_catalog_update ON apps_catalog
  FOR UPDATE USING (is_admin());

CREATE POLICY apps_catalog_delete ON apps_catalog
  FOR DELETE USING (is_admin());

-- ============================================================================
-- POLICIES: analytics_events (admin only — inserted via service role)
-- ============================================================================

CREATE POLICY analytics_events_select ON analytics_events
  FOR SELECT USING (is_admin());

CREATE POLICY analytics_events_insert ON analytics_events
  FOR INSERT WITH CHECK (is_admin());

-- ============================================================================
-- POLICIES: audit_logs (owner/admin read only — inserted via security definer)
-- ============================================================================

CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (is_admin());
