"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get all products for the current vendor
 */
export async function getVendorProducts() {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  // Get vendor
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (vendorError || !vendor) {
    return { error: "Vendor not found" };
  }

  // Get products
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { products };
}

/**
 * Toggle product availability
 */
export async function toggleProductAvailability(
  productId: string,
  isAvailable: boolean
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Create a new product
 */
export async function createProduct(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  // Get current user and vendor
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (vendorError || !vendor) {
    return { error: "Vendor not found" };
  }

  // Get form data
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const description = formData.get("description") as string;
  const imageUrls = formData.get("imageUrls") as string;

  // Parse image URLs
  const images = imageUrls ? JSON.parse(imageUrls) : [];

  // Insert product
  const { error } = await supabase.from("products").insert({
    vendor_id: vendor.id,
    name,
    price,
    description: description || null,
    images,
    is_available: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Upload product image to Supabase Storage
 */
export async function uploadProductImage(
  file: File,
  userId: string
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerSupabaseClient();

  // Create unique filename with proper extension
  // Extract extension from file name, default to jpg if not found
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  // Sanitize filename - remove special characters
  const baseName = file.name.split(".")[0].replace(/[^a-zA-Z0-9-_]/g, "-");
  const fileName = `${userId}/${Date.now()}-${baseName}.${fileExt}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // Get public URL
  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return { url: data.publicUrl };
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  // Get current user and vendor
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (vendorError || !vendor) {
    return { error: "Vendor not found" };
  }

  // Verify product belongs to vendor
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("vendor_id", vendor.id)
    .single();

  if (productError || !product) {
    return { error: "Product not found or access denied" };
  }

  // Get form data
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const description = formData.get("description") as string;
  const imageUrls = formData.get("imageUrls") as string;

  // Parse image URLs - keep existing images if not updated
  const images = imageUrls ? JSON.parse(imageUrls) : product.images;

  // Update product
  const { error } = await supabase
    .from("products")
    .update({
      name,
      price,
      description: description || null,
      images,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  // Get vendor
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (vendorError || !vendor) {
    return { error: "Vendor not found" };
  }

  // Get product - verify it belongs to vendor
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("vendor_id", vendor.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { product };
}
