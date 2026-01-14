# Cart Recovery System - Quick Setup

## What Changed?

The cart recovery system now works with **draft carts** instead of just localStorage.

### Before:
- Items added to cart → only saved in localStorage
- No way to recover cart if user never submitted
- Recovery looked for "pending" carts (submitted orders)

### Now:
- Items added to cart → saved to localStorage + Supabase as "draft" cart
- Draft cart auto-updates when items change
- Recovery prompt shows on return visit
- User can resume or start fresh

---

## Required Database Migration

**Run this SQL in Supabase:**

```sql
-- Update carts table to support draft status
ALTER TABLE carts 
DROP CONSTRAINT IF EXISTS carts_status_check;

ALTER TABLE carts 
ADD CONSTRAINT carts_status_check CHECK (status IN ('draft', 'pending', 'reviewing', 'confirmed', 'cancelled'));

CREATE INDEX IF NOT EXISTS carts_draft_recovery_idx ON carts(vendor_id, customer_id) 
  WHERE status = 'draft';
```

Or use the file: `supabase/add_draft_status.sql`

---

## How to Test

### Step 1: Add items to cart
1. Open the store
2. Add 2-3 products to cart
3. Check Supabase → carts table
4. Should see a new cart with `status = 'draft'`

### Step 2: Refresh the page
1. Press F5 to refresh
2. Recovery prompt should appear
3. Should show correct item count and total

### Step 3: Resume order
1. Click "Resume Order"
2. Cart should open with items
3. Quantities should be correct

### Step 4: Start Fresh (alternative)
1. On recovery prompt, click "Start Fresh"
2. Prompt disappears, cart is empty
3. Refresh again - prompt should NOT appear

---

## Key Code Locations

| File | Change | Purpose |
|------|--------|---------|
| `lib/cart.ts` | `saveDraftCart()` | Save cart as draft when items change |
| `lib/cart.ts` | `getDraftCart()` | Retrieve draft cart for recovery |
| `components/StoreClient.tsx` | New useEffect | Auto-save draft (debounced 500ms) |
| `components/StoreClient.tsx` | Import update | Use `getDraftCart` not `getRecoverableCart` |
| `supabase/add_draft_status.sql` | Migration | Add 'draft' status to database |

---

## Debugging

**See console logs:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Add items to cart - should log:
   ```
   Draft cart saved to Supabase
   ```
4. Refresh page - should log:
   ```
   Draft cart found for recovery:
   {
     cartId: "...",
     itemsCount: 3,
     totalQuantity: 5,
     items: [...]
   }
   ```

**Check Supabase:**
1. Open Supabase dashboard
2. Go to carts table
3. Filter by `status = 'draft'`
4. Should see your test carts

---

## What Happens Next

### Customer Flow:
1. Add items → Draft saved ✅
2. Leave page → Draft stays in Supabase ✅
3. Return → Recovery prompt appears ✅
4. Resume → Cart loads ✅
5. Submit → Draft cleared, pending created ✅

### Important Notes:
- Draft carts are **always updated** (not duplicated)
- Draft cart is tied to **vendor + customer combo**
- Dismissal tracked locally (won't re-show same cart)
- Submitting order clears draft + dismissal tracking
- Next visit shows new draft if items added again ✅

---

## API Response Examples

### saveDraftCart response:
```typescript
{
  cart: {
    id: "uuid",
    vendor_id: "uuid",
    customer_id: "uuid",
    items: [{product_id, name, price, quantity, image_url}],
    status: "draft",
    created_at: "2024-01-14T10:00:00Z",
    updated_at: "2024-01-14T10:05:00Z"
  },
  error: null
}
```

### getDraftCart response (if found):
```typescript
{
  cart: { ...same as above... },
  error: null
}
```

### getDraftCart response (if not found):
```typescript
{
  cart: null,
  error: null  // NOT an error, just no cart exists
}
```

---

## Next Steps

1. ✅ Run the SQL migration in Supabase
2. ✅ Test the recovery flow with actual items
3. ✅ Verify correct counts show in recovery prompt
4. ✅ Check that dismissed carts don't re-appear
5. Consider: Product filtering, auto-save UI feedback, cart sync across tabs
