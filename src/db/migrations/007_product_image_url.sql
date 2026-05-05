-- Migration 007: Add image_url to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_url TEXT;
