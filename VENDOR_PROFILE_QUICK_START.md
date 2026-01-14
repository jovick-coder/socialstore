# Vendor Profile Enhancements - Quick Setup

## 🚀 Quick Start (5 minutes)

### Step 1: Run Database Migration

Copy and paste this into your Supabase SQL Editor:

```sql
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT,
ADD COLUMN IF NOT EXISTS response_time TEXT;

CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
```

### Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → **Storage** (left sidebar)
2. Click **"Create a new bucket"** button
3. Enter bucket name: `vendor-logos`
4. Check the box **"Public bucket"** ✓
5. Click **"Create bucket"**

### Step 3: Done! ✅

The vendor profile enhancements are now live:
- Visit `/dashboard/profile` to add business information
- Customers will see the new information on store pages

---

## 🎯 New Features

### For Vendors
- Upload business logo (JPG, PNG - max 5MB)
- Enter business location/city
- Set business hours (free text)
- Select response time (1hr, 2hrs, 6hrs, 12hrs, 24hrs)

### For Customers
- See vendor logo on store page
- View business location as a badge
- See "Usually replies in X hours" badge
- View business hours

---

## 📝 Configuration

### Response Time Options

Already configured with these options:
- 1 hour
- 2 hours
- 6 hours
- 12 hours
- 24 hours

To customize, edit `components/VendorBusinessForm.tsx`:

```typescript
const RESPONSE_TIME_OPTIONS = [
  { value: '30 minutes', label: 'Usually replies in 30 minutes' },
  { value: '1 hour', label: 'Usually replies in 1 hour' },
  // ... add more options
]
```

### Logo Upload Constraints

Current limits in `VendorBusinessForm.tsx`:
- Max size: 5MB
- Allowed types: image/* (JPG, PNG, GIF, WebP, etc.)
- Recommended: Square images (1:1 aspect ratio)

To change limits:

```typescript
// File validation in handleLogoUpload()
if (file.size > 5 * 1024 * 1024) { // Change 5MB here
  setError('Image must be less than 5MB')
}
```

---

## 🔌 Integration Points

### Database Fields

```typescript
interface Vendor {
  // ... existing fields
  logo_url: string | null           // URL to logo in storage
  city: string | null               // Business location
  business_hours: string | null     // Free text (e.g., "Mon-Sat 9am-6pm")
  response_time: string | null      // Selected option value
}
```

### API Endpoints

**Fetch vendor with profile:**
```typescript
const { data: vendor } = await supabase
  .from('vendors')
  .select('*')
  .eq('slug', 'store-slug')
  .single()
```

**Update business info:**
```typescript
await supabase
  .from('vendors')
  .update({
    logo_url: publicUrl,
    city: 'Lagos, Nigeria',
    business_hours: 'Mon–Sat, 9am–6pm',
    response_time: '2 hours',
  })
  .eq('id', vendorId)
```

---

## 📁 Files Added/Modified

### New Components
- `components/VendorBusinessForm.tsx` - Business info form
- `components/VendorHeader.tsx` - Store page header display

### Updated Files
- `app/dashboard/profile/page.tsx` - Added business info section
- `app/[storeSlug]/page.tsx` - Integrated vendor header

### Migration Scripts
- `supabase/add_vendor_profile_fields.sql` - Database schema

---

## 🎨 UI Preview

### Vendor Dashboard
```
┌─────────────────────────────────────┐
│ Business Information          [Edit] │
│                                     │
│ Business Logo                       │
│ ┌─────────────────┐                │
│ │   [Logo Img]    │  [Upload Logo]  │
│ └─────────────────┘  Square, <5MB   │
│                                     │
│ Location / City                     │
│ [Lagos, Nigeria...............]    │
│                                     │
│ Business Hours                      │
│ [Mon–Sat, 9am–6pm............]    │
│                                     │
│ Usually Replies In                  │
│ [Usually replies in 2 hours  ▼]   │
│                                     │
│              [Cancel] [Save]        │
└─────────────────────────────────────┘
```

### Public Store Page
```
┌─────────────────────────────────────┐
│ [Logo]  Store Name                  │
│         Store description...        │
│         [Lagos 📍] [Replies 2hrs ⏱] │
│ ─────────────────────────────────── │
│ Business Hours: Mon–Sat, 9am–6pm   │
│                                     │
│ Our Products (12 available)         │
│ [Product Grid...]                   │
└─────────────────────────────────────┘
```

---

## ✅ Verification

### Check if setup is complete:

1. **Database columns exist:**
   ```sql
   SELECT logo_url, city, business_hours, response_time 
   FROM vendors LIMIT 1;
   ```

2. **Storage bucket created:**
   - Supabase Dashboard → Storage
   - Should see `vendor-logos` bucket

3. **Features work:**
   - Go to `/dashboard/profile`
   - Should see "Business Information" section
   - Should be able to upload logo
   - Public store pages should show information

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Column not found" error | Run the SQL migration |
| "Bucket not found" when uploading | Create `vendor-logos` bucket in Storage |
| Logo doesn't upload | Check file size (<5MB) and format (JPG/PNG) |
| Logo displays but URL breaks | Ensure bucket is marked as Public |
| Fields don't save | Check database, ensure authenticated user |

---

## 🔒 Security Notes

- ✅ Storage bucket policies restrict uploads to authenticated users
- ✅ All vendor data validated before database insert
- ✅ File type and size checked client-side AND server-side
- ✅ RLS policies ensure vendors can only update their own data
- ✅ Storage bucket is public (read-only) but controlled for writes

---

## 📚 Complete Documentation

See `VENDOR_PROFILE_ENHANCEMENTS.md` for:
- Detailed component documentation
- Advanced configuration options
- Performance optimization tips
- Mobile responsiveness details
- Accessibility features
- Future enhancement ideas
- Testing checklist
- Full troubleshooting guide

---

## 💡 Tips & Best Practices

1. **Logo Upload:** Recommend square images for best appearance
2. **Business Hours:** Use clear format like "Mon–Sat, 9am–6pm"
3. **Response Time:** Set realistic times to build trust
4. **Location:** Use full format like "Lagos, Nigeria"
5. **Empty State:** All fields are optional - graceful fallbacks included

---

## 🚀 Next Steps

1. ✅ Run database migration
2. ✅ Create storage bucket
3. ✅ Test vendor profile page `/dashboard/profile`
4. ✅ Upload a test logo
5. ✅ Check public store page displays correctly
6. ✅ Share with vendors to start adding their info!

---

**Questions?** Check `VENDOR_PROFILE_ENHANCEMENTS.md` for detailed documentation.
