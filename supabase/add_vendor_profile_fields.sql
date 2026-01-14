-- =============================================
-- Add Vendor Profile Enhancement Fields
-- =============================================
-- This migration adds trust-building business information fields to the vendors table

-- Add new columns to vendors table
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT,
ADD COLUMN IF NOT EXISTS response_time TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);

-- Add comment for documentation
COMMENT ON COLUMN vendors.logo_url IS 'URL to uploaded business logo (stored in Supabase Storage)';
COMMENT ON COLUMN vendors.city IS 'Business location / city (optional)';
COMMENT ON COLUMN vendors.business_hours IS 'Free text business hours (e.g., "Mon–Sat, 9am–6pm") (optional)';
COMMENT ON COLUMN vendors.response_time IS 'Expected response time (e.g., "1 hour", "24 hours") (optional)';

-- Update existing RLS policy to allow vendors to read their own data (including new fields)
-- This is already covered by the existing policy, but documented here for clarity
