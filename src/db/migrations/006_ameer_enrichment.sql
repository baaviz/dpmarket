-- 006_ameer_enrichment.sql

-- Add new columns to apps_catalog for enrichment
ALTER TABLE public.apps_catalog
ADD COLUMN IF NOT EXISTS source_icon_url TEXT,
ADD COLUMN IF NOT EXISTS icon_storage_path TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_provider TEXT DEFAULT 'doha_plus',
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS bundle_id TEXT,
ADD COLUMN IF NOT EXISTS version TEXT,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS features TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create table for ameer catalog (raw scraped data before matching)
CREATE TABLE IF NOT EXISTS public.ameer_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    features TEXT,
    icon_url TEXT,
    source_url TEXT NOT NULL,
    bundle_id TEXT,
    version TEXT,
    size TEXT,
    last_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for enrichment matching review
CREATE TABLE IF NOT EXISTS public.enrichment_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doha_app_id UUID REFERENCES public.apps_catalog(id) ON DELETE CASCADE,
    ameer_app_id UUID REFERENCES public.ameer_catalog(id) ON DELETE CASCADE,
    confidence_score NUMERIC(5,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doha_app_id, ameer_app_id)
);

-- Enable RLS
ALTER TABLE public.ameer_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_matches ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage ameer_catalog" ON public.ameer_catalog;
CREATE POLICY "Admins can manage ameer_catalog" ON public.ameer_catalog FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND is_active = true)
);

DROP POLICY IF EXISTS "Admins can manage enrichment_matches" ON public.enrichment_matches;
CREATE POLICY "Admins can manage enrichment_matches" ON public.enrichment_matches FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND is_active = true)
);
