# 🔧 Fix: Public Store Access When Logged Out

## Problem
Store pages return 404 when you're logged out, but work fine when logged in.

## Root Cause
Supabase **Row-Level Security (RLS)** policies block unauthenticated users from reading the `vendors` and `products` tables.

---

## ✅ Quick Fix (2 Minutes)

### Run This SQL in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this:

```sql
-- Enable public read access to vendors
CREATE POLICY "Public can read vendors"
  ON vendors FOR SELECT
  TO public
  USING (true);

-- Enable public read access to products
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  TO public
  USING (is_available = true);

-- Enable public read access to carts
CREATE POLICY "Public can read carts"
  ON carts FOR SELECT
  TO public
  USING (true);
```

3. Click **Run**
4. Done! ✅

---

## Test

### Before Fix
```
Logged in:  https://socialstore.vercel.app/your-store ✅ Works
Logged out: https://socialstore.vercel.app/your-store ❌ 404 Error
```

### After Fix
```
Logged in:  https://socialstore.vercel.app/your-store ✅ Works
Logged out: https://socialstore.vercel.app/your-store ✅ Works
```

---

## Why This Happens

- By default, Supabase RLS blocks all access to unauthenticated users
- We need to explicitly allow public READ access
- This keeps WRITE operations (create, update, delete) secure

---

## Code Already Updated

The store page now uses a public client:

```typescript
// file: app/[storeSlug]/page.tsx
import { createPublicSupabaseClient } from '@/lib/supabase/public'

const supabase = await createPublicSupabaseClient()
// Now can read without auth
```

---

## Summary

**Issue:** RLS policies blocking public reads  
**Fix:** Add 3 SQL policies for public SELECT  
**Result:** Stores viewable by anyone  
**Time:** 2 minutes  

That's it! 🎉
