-- =============================================
-- Add 'draft' status to carts table
-- =============================================
-- This migration adds support for draft carts (for cart recovery system)
-- Draft carts are saved automatically when items are added and recovered on next visit

-- Update the CHECK constraint to include 'draft'
-- Note: We need to drop and recreate the constraint

-- First, drop existing constraint
ALTER TABLE carts 
DROP CONSTRAINT IF EXISTS carts_status_check;

-- Add new constraint with 'draft' status
ALTER TABLE carts 
ADD CONSTRAINT carts_status_check CHECK (status IN ('draft', 'pending', 'reviewing', 'confirmed', 'cancelled'));

-- Create index for draft carts recovery
CREATE INDEX IF NOT EXISTS carts_draft_recovery_idx ON carts(vendor_id, customer_id) 
  WHERE status = 'draft';

-- Comment explaining draft status
COMMENT ON TABLE carts IS 'Cart management - status: draft (in-progress), pending (submitted), reviewing (vendor), confirmed (accepted), cancelled';
