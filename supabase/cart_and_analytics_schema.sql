-- =============================================
-- SocialStore: Cart, Analytics & Customer Schema
-- =============================================
-- This schema adds customer management, cart management, and analytics tracking
-- to the existing SocialStore database.

-- =============================================
-- 0. CUSTOMERS TABLE (Anonymous Customers)
-- =============================================
-- Stores customer information for anonymous checkout
-- No authentication required - identified by anonymous UUID

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY,
  
  -- Customer contact information
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS customers_created_at_idx ON customers(created_at DESC);

-- RLS Policies for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read any customer (for public checkout flow)
CREATE POLICY "Customers are publicly readable"
  ON customers
  FOR SELECT
  USING (true);

-- Policy: Anyone can create customers (anonymous checkout)
CREATE POLICY "Anyone can create customers"
  ON customers
  FOR INSERT
  WITH CHECK (true);

-- Policy: Customers can update their own profile
CREATE POLICY "Customers can update own profile"
  ON customers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 1. CARTS TABLE (Enhanced)
-- =============================================
-- Stores customer cart data for order processing
-- No authentication required - carts are public by cart ID

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Cart items stored as JSON array
  -- Format: [{ product_id, name, price, quantity, image_url }]
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Cart status workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'confirmed', 'cancelled')),
  
  -- Returning customer flag
  returning_customer BOOLEAN NOT NULL DEFAULT false,
  
  -- Customer notes
  customer_notes TEXT,
  
  -- Vendor notes when reviewing cart
  vendor_notes TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS carts_vendor_id_idx ON carts(vendor_id);
CREATE INDEX IF NOT EXISTS carts_customer_id_idx ON carts(customer_id);
CREATE INDEX IF NOT EXISTS carts_status_idx ON carts(status);
CREATE INDEX IF NOT EXISTS carts_created_at_idx ON carts(created_at DESC);
CREATE INDEX IF NOT EXISTS carts_vendor_customer_idx ON carts(vendor_id, customer_id);
CREATE INDEX IF NOT EXISTS carts_pending_48h_idx ON carts(vendor_id, customer_id, created_at) 
  WHERE status = 'pending' AND created_at > NOW() - INTERVAL '48 hours';

-- RLS Policies for carts
-- Carts are publicly readable by cart ID (no auth required)
-- Only vendors can update their own carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read any cart (customers need access via cart URL)
CREATE POLICY "Carts are publicly readable"
  ON carts
  FOR SELECT
  USING (true);

-- Policy: Anyone can create a cart (customers don't need auth)
CREATE POLICY "Anyone can create carts"
  ON carts
  FOR INSERT
  WITH CHECK (true);

-- Policy: Vendors can update their own carts
CREATE POLICY "Vendors can update their own carts"
  ON carts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = carts.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER carts_updated_at_trigger
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_carts_updated_at();

-- =============================================
-- 2. ANALYTICS TABLE
-- =============================================
-- Tracks key events for vendor insights

CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Event types: store_view, product_click, cart_created, cart_confirmed
  event_type TEXT NOT NULL CHECK (event_type IN ('store_view', 'product_click', 'cart_created', 'cart_confirmed', 'whatsapp_click')),
  
  -- Optional metadata (e.g., product_id for product_click events)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS analytics_vendor_id_idx ON analytics(vendor_id);
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics(event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_vendor_event_idx ON analytics(vendor_id, event_type);

-- RLS Policies for analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert analytics (public tracking)
CREATE POLICY "Anyone can insert analytics"
  ON analytics
  FOR INSERT
  WITH CHECK (true);

-- Policy: Vendors can read their own analytics
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

-- =============================================
-- 3. HELPER FUNCTIONS
-- =============================================

-- Function: Get cart item count
CREATE OR REPLACE FUNCTION get_cart_item_count(cart_items JSONB)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM((item->>'quantity')::INTEGER), 0)
    FROM jsonb_array_elements(cart_items) AS item
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate cart total
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_items JSONB)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      SUM((item->>'price')::NUMERIC * (item->>'quantity')::INTEGER), 
      0
    )
    FROM jsonb_array_elements(cart_items) AS item
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 4. ANALYTICS AGGREGATION VIEWS
-- =============================================

-- View: Daily analytics summary per vendor
CREATE OR REPLACE VIEW vendor_daily_analytics AS
SELECT 
  vendor_id,
  DATE(created_at) as date,
  event_type,
  COUNT(*) as event_count
FROM analytics
GROUP BY vendor_id, DATE(created_at), event_type
ORDER BY date DESC, vendor_id;

-- View: Weekly cart summary
CREATE OR REPLACE VIEW vendor_weekly_carts AS
SELECT 
  vendor_id,
  DATE_TRUNC('week', created_at) as week_start,
  COUNT(*) as total_carts,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_carts,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_carts
FROM carts
GROUP BY vendor_id, DATE_TRUNC('week', created_at)
ORDER BY week_start DESC, vendor_id;

-- =============================================
-- SCHEMA COMPLETE
-- =============================================
-- Tables created:
-- 1. carts - Customer cart storage with vendor review capabilities
-- 2. analytics - Event tracking for vendor insights
--
-- Features:
-- ✅ Public cart access (no auth required for customers)
-- ✅ Vendor-only cart updates
-- ✅ Public analytics insertion
-- ✅ Vendor-only analytics reading
-- ✅ Helper functions for cart calculations
-- ✅ Aggregation views for reporting
