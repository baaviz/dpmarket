-- ============================================================
-- Migration 005: Global Settings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public     BOOLEAN NOT NULL DEFAULT false,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES public.admin_profiles(id)
);

-- RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS settings_public_read ON public.settings;
CREATE POLICY settings_public_read ON public.settings
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS settings_admin_all ON public.settings;
CREATE POLICY settings_admin_all ON public.settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

DROP TRIGGER IF EXISTS set_settings_updated_at ON settings;
CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, is_public) VALUES
('store_info', '{"name": "Doha Plus", "description": "Premium Apps & Activation Codes", "contact_email": "support@dohaplus.com", "contact_whatsapp": "+966500000000"}', true),
('branding', '{"logo_url": null, "favicon_url": null, "primary_color": "#14b8a6", "theme": "light"}', true),
('payment', '{"myfatoorah_enabled": true, "myfatoorah_test_mode": true}', false),
('social_links', '{"twitter": null, "instagram": null, "snapchat": null, "tiktok": null}', true)
ON CONFLICT (key) DO NOTHING;
