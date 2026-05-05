-- ============================================================================
-- Doha Plus Market — Storage Buckets & Policies
-- ============================================================================
-- Run AFTER 002_rls_policies.sql
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', TRUE, 5242880, -- 5MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('app-icons', 'app-icons', TRUE, 2097152, -- 2MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Product images: public read, admin write
CREATE POLICY storage_product_images_select ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY storage_product_images_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND is_admin()
  );

CREATE POLICY storage_product_images_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND is_admin()
  );

CREATE POLICY storage_product_images_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND is_admin()
  );

-- App icons: public read, admin write
CREATE POLICY storage_app_icons_select ON storage.objects
  FOR SELECT USING (bucket_id = 'app-icons');

CREATE POLICY storage_app_icons_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'app-icons'
    AND is_admin()
  );

CREATE POLICY storage_app_icons_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'app-icons'
    AND is_admin()
  );

CREATE POLICY storage_app_icons_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'app-icons'
    AND is_admin()
  );
