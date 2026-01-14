-- =============================================
-- Fix Cart RLS for Draft Cart Deletion
-- =============================================
-- Allow anyone to delete their own draft carts (for cart recovery "Start Fresh" feature)

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Vendors can delete their own carts" ON carts;
DROP POLICY IF EXISTS "Anyone can delete carts" ON carts;

-- Policy: Anyone can delete carts (needed for draft cart deletion in cart recovery)
CREATE POLICY "Anyone can delete carts"
  ON carts
  FOR DELETE
  USING (true);

-- Alternative: More restrictive - only allow deletion of draft carts
-- CREATE POLICY "Anyone can delete draft carts"
--   ON carts
--   FOR DELETE
--   USING (status = 'draft');
