# Vendor Profile Enhancements - Implementation Guide

## Overview

This guide covers the implementation of trust-building vendor profile enhancements for SocialStore. These features help vendors showcase their business information and build customer trust through logos, location, business hours, and response times.

---

## Features Implemented

### 1. **Vendor Business Information Fields**

Four new optional fields added to the vendors table:

| Field | Type | Purpose |
|-------|------|---------|
| `logo_url` | TEXT | Business logo (uploaded to Supabase Storage) |
| `city` | TEXT | Business location |
| `business_hours` | TEXT | Operating hours (free text format) |
| `response_time` | TEXT | Expected response time (e.g., "2 hours", "24 hours") |

### 2. **Vendor Profile Page** (`/dashboard/profile`)

Enhanced with a new "Business Information" section that allows vendors to:
- Upload and preview business logo
- Enter city/location
- Set business hours (free text)
- Select expected response time from dropdown

**Key Features:**
- Square image preview (24x24 px)
- Fallback avatar with store initials if no logo
- File validation (images only, max 5MB)
- Image upload to Supabase Storage (`vendor-logos` bucket)
- Inline success/error messages
- Card-based layout matching existing profile design
- Edit/View modes

### 3. **Public Store Page** (`/[storeSlug]`)

Displays vendor trust information prominently:

**VendorHeader Component:**
- Business logo with initials fallback
- Store name and description
- Location badge (if set)
- Response time badge (if set)
- Business hours section (if set)
- Mobile-first responsive design
- Color-coded badges (blue for location, green for response time)

### 4. **Database Schema**

**Migration File:** `supabase/add_vendor_profile_fields.sql`

```sql
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT,
ADD COLUMN IF NOT EXISTS response_time TEXT;

CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
```

---

## File Structure

### New Files Created

```
components/
├── VendorBusinessForm.tsx       # Business info form component
└── VendorHeader.tsx             # Vendor header display component

supabase/
└── add_vendor_profile_fields.sql # Database migration

Updated Files:
app/dashboard/profile/page.tsx    # Added business info section
app/[storeSlug]/page.tsx          # Integrated VendorHeader component
```

---

## Component Documentation

### `VendorBusinessForm` Component

**Purpose:** Handles editing and uploading vendor business information

**Props:**
```typescript
interface VendorBusinessFormProps {
  vendorId: string                    // Vendor ID for upload path
  storeName: string                   // Store name for avatar fallback
  initialData: VendorBusinessInfo    // Current business info
  isEditing: boolean                  // Show/hide form
  onSave: (data: VendorBusinessInfo) => Promise<void>
  isSaving: boolean                   // Show saving state
}
```

**Features:**
- Logo upload with preview and fallback avatar
- File validation (type and size)
- Error handling with user feedback
- Debounced Supabase Storage upload
- Response time dropdown selector
- City and business hours text inputs
- Info box explaining trust-building benefits

**Key Functions:**
- `handleLogoUpload()` - Validates and uploads logo to Supabase Storage
- `handleSubmit()` - Saves all business info to database
- `getStoreInitials()` - Generates avatar fallback (e.g., "AC" for "Apple Cafe")

---

### `VendorHeader` Component

**Purpose:** Displays vendor information on public store page

**Props:**
```typescript
interface VendorHeaderProps {
  storeName: string
  logoUrl?: string | null
  city?: string | null
  businessHours?: string | null
  responseTime?: string | null
  whatsappNumber: string
  description?: string | null
}
```

**Features:**
- Logo with initials fallback (24x24 px, square)
- Store name and description
- Trust badges (location and response time)
- Business hours section
- Mobile-first responsive design
- Semantic SVG icons

---

## Database Setup

### 1. Run Migration

Execute this SQL in your Supabase SQL editor:

```sql
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT,
ADD COLUMN IF NOT EXISTS response_time TEXT;

CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
```

### 2. Create Storage Bucket

Create a new public storage bucket named `vendor-logos`:

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `vendor-logos`
4. Public: ✓ (check this box)
5. Create bucket

### 3. Set Storage Bucket Policy (Optional but Recommended)

Add RLS policy for vendor-logos bucket:

```sql
-- Allow public read access to logos
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-logos');

-- Allow vendors to upload their own logos
CREATE POLICY "Vendor Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-logos'
    AND auth.uid() IS NOT NULL
  );
```

---

## Usage Guide

### For Vendors

#### Adding Business Information

1. Go to Dashboard → Profile Settings
2. Click "Edit" button
3. Click "Business Information" section
4. Fill in fields:
   - **Business Logo:** Click "Upload Logo" to select image
   - **Location:** Enter city (e.g., "Lagos, Nigeria")
   - **Business Hours:** Enter hours (e.g., "Mon–Sat, 9am–6pm")
   - **Usually Replies In:** Select from dropdown
5. Click "Save Business Info"
6. Success message appears

#### Image Upload Tips

- **Format:** JPG, PNG recommended
- **Size:** Up to 5MB
- **Aspect Ratio:** Square recommended (1:1)
- **Dimensions:** Minimum 200x200px recommended

### For Customers

Customers see enhanced store pages with:
- Business logo (if uploaded)
- Store location with map icon
- Response time badge ("Replies in 2 hours")
- Business hours information
- Product count
- Store description

---

## UI/UX Details

### Vendor Profile Page

**Card Layout:**
```
┌─ Store Information ────────── [Edit] ─┐
│ Store Name: [Read-only input]         │
│ Store Slug: [Read-only]               │
│ WhatsApp: [+234...]                   │
│ Description: [Textarea]               │
│ [Cancel] [Save Changes]               │
└───────────────────────────────────────┘

┌─ Business Information ───────── [Edit] ─┐
│ Business Logo    [Upload Logo]         │
│ Location         [City input]          │
│ Business Hours   [Time input]          │
│ Reply Time       [Dropdown]            │
│ [Cancel] [Save Business Info]          │
└──────────────────────────────────────┘
```

### Public Store Page

```
┌─ Vendor Header ─────────────────────┐
│ [Logo] Store Name                   │
│        Description                  │
│        [Lagos 🏠] [Replies in 2h ⏱] │
│ ─────────────────────────────────── │
│ Business Hours: Mon–Sat, 9am–6pm   │
└──────────────────────────────────────┘

Our Products (12 products)
[Product Grid...]
```

---

## Technical Details

### Image Upload Flow

```
User selects file
  ↓
Validate (type, size)
  ↓
Show preview (ObjectURL)
  ↓
Upload to Supabase Storage
  ↓
Get public URL
  ↓
Save URL to database
  ↓
Success message
```

### Response Time Options

```typescript
const RESPONSE_TIME_OPTIONS = [
  { value: '1 hour', label: 'Usually replies in 1 hour' },
  { value: '2 hours', label: 'Usually replies in 2 hours' },
  { value: '6 hours', label: 'Usually replies in 6 hours' },
  { value: '12 hours', label: 'Usually replies in 12 hours' },
  { value: '24 hours', label: 'Usually replies in 24 hours' },
]
```

---

## Error Handling

### Common Error Scenarios

| Scenario | Handling | Message |
|----------|----------|---------|
| Invalid image type | Rejected | "Please select an image file" |
| File too large | Rejected | "Image must be less than 5MB" |
| Upload fails | Display error | Upload error message from Supabase |
| Save fails | Display error | Database error message |

### User Feedback

- **Success:** Green banner with checkmark
- **Error:** Red banner with error message
- **Loading:** Disabled button with spinner
- **Auto-dismiss:** Success messages disappear after 3 seconds

---

## Performance Considerations

### Optimization

1. **Image Caching:** Supabase Storage caches with 3600s TTL
2. **Debounced Save:** 500ms debounce on form changes
3. **Lazy Loading:** Images load with Next.js Image optimization
4. **Indexed Queries:** `city` field indexed for filtering

### Storage Limits

- Max file size: 5MB per image
- Recommended image size: 200x200px - 1000x1000px
- Format: JPG (best compression), PNG (transparency)

---

## Mobile Responsiveness

### Breakpoints

- **Mobile (<640px):**
  - Logo: 80x80px
  - Single column layout
  - Full-width buttons
  - Touch-friendly inputs (44px min height)

- **Tablet/Desktop (640px+):**
  - Logo: 96x96px
  - Side-by-side layout for logo + info
  - Inline buttons
  - Compact styling

---

## Accessibility

### Features

- ✅ Semantic HTML (form, label, input)
- ✅ ARIA labels on images
- ✅ Keyboard navigation (Tab, Enter)
- ✅ Color contrast meets WCAG AA
- ✅ Error messages associated with fields
- ✅ Loading states announced
- ✅ Mobile-first touch targets (44px minimum)

---

## Future Enhancements

1. **Image Cropping:** Add image crop tool before upload
2. **Drag & Drop:** Allow drag-drop logo upload
3. **Social Links:** Add social media links field
4. **Ratings:** Display vendor ratings on store page
5. **Verification Badge:** Show verified vendor badge
6. **Business Categories:** Categorize vendors by business type
7. **Analytics:** Track logo views and engagement

---

## Testing Checklist

- [ ] Logo upload works (JPG, PNG)
- [ ] File size validation works
- [ ] Preview updates on selection
- [ ] Fallback avatar displays without logo
- [ ] All fields save to database
- [ ] Fields display correctly on public store page
- [ ] Mobile layout is responsive
- [ ] Error messages display correctly
- [ ] Success messages appear and auto-dismiss
- [ ] Edit/Cancel buttons work correctly
- [ ] Images load fast with optimization

---

## Support & Troubleshooting

### Logo Not Uploading

**Check:**
1. Storage bucket `vendor-logos` exists and is public
2. File is valid image (JPG/PNG)
3. File size < 5MB
4. Browser console for errors

### Fields Not Saving

**Check:**
1. Run migration SQL
2. User is authenticated
3. Vendor ID exists in database
4. Check browser console for errors

### Images Not Displaying

**Check:**
1. Storage bucket is public
2. URL is valid (check database)
3. CORS settings allow image loading
4. Image format is supported

---

## Code Examples

### Fetching Vendor with Business Info

```typescript
const { data: vendor } = await supabase
  .from('vendors')
  .select('*')
  .eq('slug', storeSlug)
  .single()

// vendor includes: logo_url, city, business_hours, response_time
```

### Updating Business Info

```typescript
const { error } = await supabase
  .from('vendors')
  .update({
    logo_url: 'https://...',
    city: 'Lagos, Nigeria',
    business_hours: 'Mon–Sat, 9am–6pm',
    response_time: '2 hours',
  })
  .eq('id', vendorId)
```

---

## Links & Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
- [TailwindCSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
