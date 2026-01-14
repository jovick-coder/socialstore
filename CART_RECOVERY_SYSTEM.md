# Cart Recovery System - Updated Flow

## How It Works Now

### 1. **When User Adds Items to Cart**
- Item is added to local state (React)
- Cart is saved to **localStorage** (for offline access)
- Cart is **auto-saved to Supabase as a "draft" cart** (via `saveDraftCart()`)
  - If draft cart exists: updates the existing cart
  - If no draft cart exists: creates a new draft cart
- Debounced to avoid too many API calls (500ms delay)

### 2. **When User Returns to the Store**
- App checks if customer is returning (based on customerId in localStorage)
- App queries Supabase for **draft cart** (status = 'draft')
- If draft cart found and not dismissed:
  - Shows recovery prompt with item count and total
  - User can choose: "Resume Order" or "Start Fresh"
  
### 3. **When User Clicks "Resume Order"**
- Loads draft cart items into local state
- Opens cart sidebar
- User can edit items before submitting

### 4. **When User Submits Order**
- Creates a new **pending cart** in Supabase (status = 'pending')
- Clears the draft cart from localStorage
- Clears dismissed cart tracking
- Redirects to WhatsApp

### 5. **When User Clicks "Start Fresh"**
- Saves cart ID to localStorage as dismissed: `dismissed_cart_${vendor.id}`
- Draft cart remains in Supabase but won't show recovery prompt again
- User starts with empty cart

---

## Database Schema Update Required

**File:** `supabase/add_draft_status.sql`

Run this migration to update the carts table:
```sql
ALTER TABLE carts 
DROP CONSTRAINT IF EXISTS carts_status_check;

ALTER TABLE carts 
ADD CONSTRAINT carts_status_check CHECK (status IN ('draft', 'pending', 'reviewing', 'confirmed', 'cancelled'));

CREATE INDEX IF NOT EXISTS carts_draft_recovery_idx ON carts(vendor_id, customer_id) 
  WHERE status = 'draft';
```

---

## New Cart Statuses

| Status | Purpose |
|--------|---------|
| **draft** | In-progress cart, auto-saved when items are added |
| **pending** | Submitted by customer, waiting for vendor review |
| **reviewing** | Vendor is reviewing the order |
| **confirmed** | Vendor accepted the order |
| **cancelled** | Order cancelled by vendor or customer |

---

## API Functions

### New Functions in `lib/cart.ts`:

**`saveDraftCart(vendorId, items, customerId)`**
- Saves or updates a draft cart in Supabase
- Called automatically when cart items change (debounced)
- Returns: `{ cart: Cart | null; error: any }`

**`getDraftCart(vendorId, customerId)`**
- Retrieves existing draft cart for recovery
- Returns: `{ cart: Cart | null; error: any }`
- Returns `null` if no draft cart found (not an error)

**`createCart(vendorId, items, customerId, isReturning)` (unchanged)**
- Creates a **pending** cart when user submits order
- Different from draft - this is the final submitted cart

---

## Testing the Feature

1. **Add items to cart:**
   - Add products to cart
   - Check browser's Application → Storage → Local Storage for customer ID
   - Check Supabase carts table for new draft cart (status = 'draft')

2. **Refresh page:**
   - Recovery prompt should appear
   - Should show correct item count and total

3. **Test "Resume Order":**
   - Items should load back into cart
   - Can modify quantities before submitting

4. **Test "Start Fresh":**
   - Prompt disappears
   - Add new items to cart
   - On next visit, should NOT show old recovery prompt
   - Should show new recovery prompt with new items

5. **Submit order:**
   - Draft cart should be cleared
   - New pending cart created
   - localStorage dismissed tracking cleared

---

## Troubleshooting

### Recovery prompt not showing:
- Check Supabase for draft cart (should have status = 'draft')
- Check browser console for errors
- Verify customer ID is saved in localStorage

### Wrong item count showing:
- Check the items array structure in Supabase
- Should be: `[{product_id, name, price, quantity, image_url}, ...]`

### Draft cart not saving:
- Check browser console for saveDraftCart errors
- Verify customerId is set before items added
- Ensure Supabase connection is working

---

## Code Changes Made

1. **lib/cart.ts:**
   - Added `saveDraftCart()` function
   - Added `getDraftCart()` function
   - Kept `getRecoverableCart()` for backward compatibility

2. **components/StoreClient.tsx:**
   - Updated imports to use `getDraftCart` instead of `getRecoverableCart`
   - Added new useEffect to auto-save draft carts (debounced)
   - Updated recovery logic to check for draft carts
   - Added console logging for debugging

3. **supabase/add_draft_status.sql:**
   - Migration file to add 'draft' status to carts
   - Add index for draft cart queries
