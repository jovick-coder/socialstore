-- SQL Migration: Update products table to support new wizard fields
-- This script adds missing columns to the products table to match ProductWizardData

-- Add missing columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS contact_for_price BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'in-stock',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add constraint for availability enum
ALTER TABLE products
ADD CONSTRAINT check_availability CHECK (
  availability IN ('in-stock', 'limited', 'pre-order')
);

-- Update price column to allow NULL (for contact_for_price products)
ALTER TABLE products
ALTER COLUMN price DROP NOT NULL;

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Create composite index for vendor + category (common query)
CREATE INDEX IF NOT EXISTS idx_products_vendor_category ON products(vendor_id, category);

-- Add comment for documentation
COMMENT ON TABLE products IS 'Products table with support for dynamic attributes per category';
COMMENT ON COLUMN products.category IS 'Product category (clothing, electronics, beauty, food, home, other)';
COMMENT ON COLUMN products.contact_for_price IS 'If true, price is hidden and customer must contact for pricing';
COMMENT ON COLUMN products.attributes IS 'JSONB field storing category-specific attributes (sizes, colors, etc)';
COMMENT ON COLUMN products.availability IS 'Stock status: in-stock, limited, or pre-order';
COMMENT ON COLUMN products.is_active IS 'Whether product is currently published/visible';
