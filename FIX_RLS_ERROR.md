# Fix: Row Level Security Policy Error

## Problem
When creating a product, you get this error:
```
new row violates row-level security policy
```

This happens because the RLS (Row Level Security) policy on the `products` table is rejecting your insert attempt.

## Root Cause
The RLS policy uses a subquery `SELECT id FROM vendors WHERE user_id = auth.uid()` which may have issues in some Supabase configurations. The improved version uses `EXISTS` which is more reliable.

## Solution

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (in the left sidebar)
3. Click **New Query**

### Step 2: Replace the Products RLS Policies
Copy and paste the contents of `supabase/products_schema_fixed.sql` into the SQL Editor and click **Run**.

This will:
- Drop the old RLS policies
- Create improved policies using `EXISTS` instead of `IN (SELECT ...)`
- Set proper access rules for authenticated and anonymous users

### Step 3: Test the Fix
1. Go to your app's **Add Product** page
2. Try uploading a product again
3. You should now see the product appear in your dashboard

## What Changed

**Old Policy (doesn't work reliably):**
```sql
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors WHERE user_id = auth.uid()
  )
)
```

**New Policy (works reliably):**
```sql
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors 
    WHERE vendors.id = products.vendor_id 
    AND vendors.user_id = auth.uid()
  )
)
```

The `EXISTS` approach is more efficient and reliable for RLS checks in Supabase.

## If You Still Get the Error

1. **Check that your vendor was created successfully:**
   - Go to Supabase Dashboard → Database → `vendors` table
   - Make sure you see a row with your user_id

2. **Check vendors table RLS:**
   - Go to Supabase Dashboard → Database → `vendors` table
   - Click the security icon (🔐) to see RLS policies
   - Make sure you have a policy allowing `SELECT` for authenticated users

3. **Enable RLS on products table:**
   ```sql
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ```

4. **Check your Supabase logs:**
   - Go to Logs → Edge Functions or Database Logs
   - Look for more detailed error information

## Quick Checklist
- ✅ Ran `products_schema_fixed.sql` in SQL Editor
- ✅ Can see your vendor in `vendors` table
- ✅ RLS is enabled on both `vendors` and `products` tables
- ✅ Have valid auth session (not logged out)
