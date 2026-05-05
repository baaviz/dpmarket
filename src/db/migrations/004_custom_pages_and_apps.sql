-- ============================================================
-- Migration 004: Custom Pages & Apps Catalog Tables
-- ============================================================

DO $$ BEGIN
    CREATE TYPE page_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE page_template AS ENUM ('basic', 'marketing', 'help', 'policy', 'landing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- Custom Pages
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  template      page_template NOT NULL DEFAULT 'basic',
  status        page_status NOT NULL DEFAULT 'draft',

  title_ar      TEXT NOT NULL,
  description_ar TEXT,
  body_ar       TEXT,
  seo_title_ar  TEXT,
  seo_desc_ar   TEXT,

  title_en      TEXT NOT NULL,
  description_en TEXT,
  body_en       TEXT,
  seo_title_en  TEXT,
  seo_desc_en   TEXT,

  og_image_path TEXT,

  sort_order    INT NOT NULL DEFAULT 0,

  created_by    UUID REFERENCES admin_profiles(id),
  updated_by    UUID REFERENCES admin_profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

-- ============================================================
-- Page Sections (block-based builder)
-- ============================================================
DO $$ BEGIN
    CREATE TYPE page_block_type AS ENUM (
      'hero', 'text', 'image', 'features', 'faq',
      'cta', 'rich_text', 'gallery', 'divider'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS page_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  block_type  page_block_type NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,

  content_ar  JSONB NOT NULL DEFAULT '{}',
  content_en  JSONB NOT NULL DEFAULT '{}',
  settings    JSONB NOT NULL DEFAULT '{}',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);

-- ============================================================
-- Apps Catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS apps_catalog (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  category      TEXT,
  icon_url      TEXT,
  banner_url    TEXT,
  source_url    TEXT,
  requires_code BOOLEAN NOT NULL DEFAULT false,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0,
  
  synced_from   TEXT,
  last_synced_at TIMESTAMPTZ,
  
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apps_catalog_slug ON apps_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_apps_catalog_category ON apps_catalog(category);
CREATE INDEX IF NOT EXISTS idx_apps_catalog_active ON apps_catalog(is_active);

-- ============================================================
-- Apps Sync Log
-- ============================================================
CREATE TABLE IF NOT EXISTS apps_sync_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_source     TEXT NOT NULL,
  status          TEXT NOT NULL,
  apps_found      INT NOT NULL DEFAULT 0,
  apps_imported   INT NOT NULL DEFAULT 0,
  apps_updated    INT NOT NULL DEFAULT 0,
  error_message   TEXT,
  triggered_by    UUID REFERENCES admin_profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pages_public_read ON pages;
CREATE POLICY pages_public_read ON pages FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS pages_admin_all ON pages;
CREATE POLICY pages_admin_all ON pages FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS page_sections_public_read ON page_sections;
CREATE POLICY page_sections_public_read ON page_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM pages WHERE pages.id = page_sections.page_id AND pages.status = 'published')
);

DROP POLICY IF EXISTS page_sections_admin_all ON page_sections;
CREATE POLICY page_sections_admin_all ON page_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

ALTER TABLE apps_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS apps_catalog_public_read ON apps_catalog;
CREATE POLICY apps_catalog_public_read ON apps_catalog FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS apps_catalog_admin_all ON apps_catalog;
CREATE POLICY apps_catalog_admin_all ON apps_catalog FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

ALTER TABLE apps_sync_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS apps_sync_log_admin_all ON apps_sync_log;
CREATE POLICY apps_sync_log_admin_all ON apps_sync_log FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

-- ============================================================
-- Updated_at trigger for new tables
-- ============================================================
DROP TRIGGER IF EXISTS set_pages_updated_at ON pages;
CREATE TRIGGER set_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_page_sections_updated_at ON page_sections;
CREATE TRIGGER set_page_sections_updated_at BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_apps_catalog_updated_at ON apps_catalog;
CREATE TRIGGER set_apps_catalog_updated_at BEFORE UPDATE ON apps_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
