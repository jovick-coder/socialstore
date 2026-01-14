-- Products table schema
-- Add this to your existing Supabase SQL Editor after the vendors table

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on vendor_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- Create index on is_available for filtering
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Vendors can read their own products
CREATE POLICY "Vendors can read own products"
  ON products
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Policy: Vendors can insert their own products
CREATE POLICY "Vendors can insert own products"
  ON products
  FOR INSERT
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Policy: Vendors can update their own products
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

-- Policy: Vendors can delete their own products
CREATE POLICY "Vendors can delete own products"
  ON products
  FOR DELETE
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Policy: Allow public to view available products (for customer catalog view)
CREATE POLICY "Public can view available products"
  ON products
  FOR SELECT
  USING (is_available = true);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant access
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Storage policy: Allow authenticated users to update their own images
CREATE POLICY "Users can update own product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: Allow public read access
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Storage policy: Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
