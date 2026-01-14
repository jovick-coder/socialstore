# Product Management Setup Guide

## 🗄️ Database Setup

### Step 1: Run Products Schema

1. Go to your Supabase Dashboard → **SQL Editor**
2. Open `supabase/products_schema.sql` from your project
3. Copy the entire contents
4. Paste into SQL Editor and click **Run**

This will create:
- ✅ `products` table with RLS policies
- ✅ Product image storage bucket
- ✅ Necessary indexes and triggers
- ✅ Storage policies for image uploads

### Step 2: Verify Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Verify `product-images` bucket exists
3. Check that it's set to **Public**

## 📱 Features Implemented

### 1. Dashboard with Empty State
- **Route**: `/dashboard`
- Shows friendly empty state when no products
- "Add Your First Product" CTA button
- Product count in header
- Share entire catalog to WhatsApp

### 2. Add Product Page
- **Route**: `/dashboard/add-product`
- Form fields:
  - Product Name (required)
  - Price in ₦ (required)
  - Description (optional)
  - Multiple image upload (optional, max 5 images)
- Real-time image preview
- Image upload to Supabase Storage
- Success/error notifications
- Auto-redirect to dashboard after success

### 3. Product Card Component
- Display product with image
- Price formatting (₦)
- In Stock / Out of Stock toggle
- Share to WhatsApp button (individual product)
- Delete product button
- Visual indication for unavailable items

### 4. WhatsApp Sharing
- **Single Product**: Share with name, price, description, and catalog link
- **Entire Catalog**: Share store name, product count, and catalog link
- Uses WhatsApp deep-link format: `https://wa.me/?text=...`
- Auto-formatted messages with emojis
- Optional WhatsApp number pre-fill

## 🎨 Design Features

- ✅ Mobile-first responsive design
- ✅ WhatsApp green (#10b981) accent color
- ✅ Card-based layouts
- ✅ Smooth transitions and hover effects
- ✅ Loading states for all async operations
- ✅ Empty states with helpful CTAs
- ✅ Accessible forms with proper labels

## 📂 File Structure

```
app/
├── dashboard/
│   ├── page.tsx                # Main dashboard with product grid
│   └── add-product/
│       └── page.tsx            # Product upload form
├── actions/
│   └── products.ts             # Server actions for CRUD operations
components/
└── ProductCard.tsx             # Reusable product card component
lib/
└── whatsapp.ts                 # WhatsApp sharing utilities
types/
└── database.ts                 # TypeScript types (updated)
supabase/
└── products_schema.sql         # Database schema
```

## 🔐 Security

All product operations are protected by:
- Row Level Security (RLS) policies
- Vendors can only see/edit their own products
- Public can view available products (for customer catalog)
- Image uploads scoped to authenticated users
- Server-side validation

## 🚀 How to Use

### Adding Products

1. Log in to your vendor account
2. Click "Add Your First Product" (or "Add Product" if you have products)
3. Fill in product details:
   - Enter product name
   - Set price
   - Add description
   - Upload images (optional)
4. Click "Add Product"
5. Redirected to dashboard with new product

### Managing Products

**Toggle Availability:**
- Click "✓ In Stock" to mark as out of stock
- Click "Mark as Available" to restock
- Out of stock items appear faded with overlay

**Share Product:**
- Click "Share" button on product card
- Opens WhatsApp with pre-filled message
- Message includes product details and catalog link

**Share Catalog:**
- Click "Share Catalog" in dashboard header
- Shares entire store with product count

**Delete Product:**
- Click "Delete" button on product card
- Confirm deletion
- Product removed from database and dashboard

## 💡 Tips

### Image Upload Best Practices
- Use clear, well-lit photos
- Max 5MB per image
- Supported formats: JPG, PNG, WebP
- Recommended: 1:1 aspect ratio (square)
- Upload up to 5 images per product

### Pricing
- Enter price in Naira (₦)
- Uses decimal format (e.g., 25000.00)
- Automatically formatted for display

### Descriptions
- Include size, color, material
- Mention key features
- Keep it concise (2-3 sentences)

## 🐛 Troubleshooting

### Images not uploading
1. Check storage bucket exists and is public
2. Verify RLS policies are correct
3. Check image size (max 5MB)
4. Ensure authenticated

### Products not showing
1. Verify you ran the SQL schema
2. Check RLS policies
3. Ensure vendor record exists
4. Check browser console for errors

### WhatsApp share not working
1. Verify catalog URL is correct
2. Check WhatsApp number format
3. Test link in browser first

## 🔧 Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In production, change to your actual domain:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📊 Database Schema

### Products Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vendor_id | UUID | References vendors table |
| name | TEXT | Product name |
| price | DECIMAL | Price in currency |
| description | TEXT | Optional description |
| images | TEXT[] | Array of image URLs |
| is_available | BOOLEAN | Stock status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Storage Bucket

- **Name**: `product-images`
- **Public**: Yes
- **Path format**: `{user_id}/{timestamp}.{ext}`

## 🎯 Next Steps

After setting up products:

1. **Build Customer Catalog View**
   - Public page at `/{slug}`
   - Browse products
   - Add to cart

2. **Shopping Cart**
   - Cart state management
   - Share cart via WhatsApp
   - Order summary

3. **Analytics**
   - Product view counts
   - Popular products
   - Sales tracking

4. **Enhanced Features**
   - Product categories
   - Bulk operations
   - CSV import/export
   - Product variants (size, color)

---

**Status**: ✅ Product Management Complete
**Ready for**: Testing and customer catalog development
