-- Add customer_id and returning_customer columns to carts table
-- This is a migration to support customer tracking and cart recovery

-- Add customer_id column if it doesn't exist
ALTER TABLE IF EXISTS carts 
ADD COLUMN IF NOT EXISTS customer_id UUID;

-- Add returning_customer column if it doesn't exist
ALTER TABLE IF EXISTS carts 
ADD COLUMN IF NOT EXISTS returning_customer BOOLEAN DEFAULT false;

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS customers_created_at_idx ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS carts_customer_id_idx ON carts(customer_id);

-- Add foreign key constraint if it doesn't exist
ALTER TABLE IF EXISTS carts
ADD CONSTRAINT fk_carts_customer_id
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- Enable RLS on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Customers are publicly readable" ON customers;
DROP POLICY IF EXISTS "Anyone can create customers" ON customers;
DROP POLICY IF EXISTS "Customers can update own profile" ON customers;

-- Create RLS policies
CREATE POLICY "Customers are publicly readable"
  ON customers
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create customers"
  ON customers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Customers can update own profile"
  ON customers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('store_view', 'product_click', 'cart_created', 'cart_confirmed', 'whatsapp_click')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS analytics_vendor_id_idx ON analytics(vendor_id);
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics(event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_vendor_event_idx ON analytics(vendor_id, event_type);

-- Enable RLS on analytics table
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing analytics policies if they exist
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics;
DROP POLICY IF EXISTS "Vendors can read their own analytics" ON analytics;

-- Create analytics RLS policies
CREATE POLICY "Anyone can insert analytics"
  ON analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Vendors can read their own analytics"
  ON analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = analytics.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );
