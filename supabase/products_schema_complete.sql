-- Complete Products Table Schema with Wizard Support
-- This is the full schema with all new fields for the product wizard

-- Create products table with all required fields
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price DECIMAL(10, 2),
  contact_for_price BOOLEAN DEFAULT false,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  
  -- Category and attributes
  category TEXT,
  attributes JSONB DEFAULT '{}',
  
  -- Availability and status
  availability TEXT DEFAULT 'in-stock',
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_availability CHECK (
    availability IN ('in-stock', 'limited', 'pre-order')
  ),
  CONSTRAINT check_price_required CHECK (
    contact_for_price = true OR price IS NOT NULL
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_vendor_category ON products(vendor_id, category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can read own products" ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;
DROP POLICY IF EXISTS "Public can view available products" ON products;

-- RLS Policy: Vendors can read their own products
CREATE POLICY "Vendors can read own products"
  ON products
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Vendors can insert their own products
CREATE POLICY "Vendors can insert own products"
  ON products
  FOR INSERT
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Vendors can update their own products
CREATE POLICY "Vendors can update own products"
  ON products
  FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Vendors can delete their own products
CREATE POLICY "Vendors can delete own products"
  ON products
  FOR DELETE
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Allow public to view active, available products
CREATE POLICY "Public can view available products"
  ON products
  FOR SELECT
  USING (is_available = true AND is_active = true);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- Comments for documentation
COMMENT ON TABLE products IS 'Products table with support for dynamic attributes per category and multi-step wizard';
COMMENT ON COLUMN products.name IS 'Product name (required)';
COMMENT ON COLUMN products.description IS 'Detailed product description';
COMMENT ON COLUMN products.price IS 'Product price in currency (NULL if contact_for_price is true)';
COMMENT ON COLUMN products.contact_for_price IS 'If true, customer must contact for pricing';
COMMENT ON COLUMN products.images IS 'Array of image URLs from product wizard';
COMMENT ON COLUMN products.category IS 'Product category (clothing, electronics, beauty, food, home, other)';
COMMENT ON COLUMN products.attributes IS 'JSONB field storing category-specific attributes (sizes, colors, materials, etc)';
COMMENT ON COLUMN products.availability IS 'Stock status: in-stock, limited, or pre-order';
COMMENT ON COLUMN products.is_active IS 'Whether product is currently published and visible to customers';
COMMENT ON COLUMN products.is_available IS 'Whether product is available for purchase';
