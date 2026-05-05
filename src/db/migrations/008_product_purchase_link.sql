-- Migration 008: Add purchase_link to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS purchase_link TEXT;
