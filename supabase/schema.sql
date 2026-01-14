-- Create vendors table
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL,
  store_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one vendor per user
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own vendor data
CREATE POLICY "Users can read own vendor data"
  ON vendors
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own vendor data
CREATE POLICY "Users can insert own vendor data"
  ON vendors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own vendor data
CREATE POLICY "Users can update own vendor data"
  ON vendors
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON vendors TO authenticated;
