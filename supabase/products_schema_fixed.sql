-- Products table schema (FIXED)
-- This is the corrected version with proper RLS policies

-- Drop existing policies if they exist (careful in production!)
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can read own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;
DROP POLICY IF EXISTS "Public can view available products" ON products;

-- IMPROVED Policy: Vendors can insert their own products
-- This policy allows insert if the vendor_id belongs to the authenticated user
CREATE POLICY "Vendors can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Policy: Vendors can read their own products
CREATE POLICY "Vendors can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Policy: Vendors can update their own products
CREATE POLICY "Vendors can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Policy: Vendors can delete their own products
CREATE POLICY "Vendors can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Policy: Allow public to view available products (for customer catalog view)
CREATE POLICY "Public can view available products"
  ON products
  FOR SELECT
  TO anon
  USING (is_available = true);

-- Make sure grants are set
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;
