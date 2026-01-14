# 🔧 Fix Storage Bucket Error

## Problem
The error `"Bucket not found"` means the `product-images` storage bucket hasn't been created yet.

## ✅ Quick Fix - Create Storage Bucket Manually

### Step 1: Create the Bucket

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click **New bucket**
4. Set these values:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Check this (enable public access)
5. Click **Create bucket**

### Step 2: Set Bucket Policies

The bucket needs policies to allow uploads. Run this SQL:

1. Go to **SQL Editor** in Supabase
2. Paste this code:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow public read access to images
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. Click **Run**

### Step 3: Verify

1. Go back to **Storage**
2. You should see `product-images` bucket
3. It should show as **Public**

## ✅ Alternative: Create Products Without Images First

You can skip images for now:

1. Go to `/dashboard/add-product`
2. Enter product name and price
3. **Don't upload any images**
4. Click "Add Product"

This will work immediately. You can add images later after setting up the bucket.

## 🔄 After Fixing

Once the bucket is created:
1. Refresh your app
2. Go to `/dashboard/add-product`
3. Upload images - should work now!

## 🐛 Still Having Issues?

**Check these:**
- Bucket name is exactly `product-images` (no typos)
- Bucket is marked as Public
- You're logged in (authenticated)
- Your Supabase URL/keys are correct in `.env.local`

**Test the bucket:**
1. Go to Storage → product-images
2. Try uploading a file manually
3. If it works, the app will work too

---

**Quick Fix**: Just create the bucket manually in Supabase Dashboard → Storage → New bucket
