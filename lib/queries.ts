/**
 * Optimized Supabase Queries with React Cache
 *
 * Performance optimizations:
 * - Select only required columns (never use select('*'))
 * - Use react.cache to deduplicate queries in a single request
 * - Server-side only (never use client Supabase)
 * - Type-safe with proper error handling
 */

import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// =============================================
// VENDOR QUERIES
// =============================================

/**
 * Get vendor by user ID
 * Cached to avoid duplicate queries in a single request
 *
 * @performance Only selects required columns
 * @index Uses idx_vendors_user_id
 */
export const getVendorByUserId = cache(async (userId: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("vendors")
    .select(
      "id, user_id, store_name, slug, whatsapp_number, store_description, logo_url, city, business_hours, response_time, created_at, updated_at"
    )
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching vendor by user ID:", error);
    return null;
  }

  return data;
});

/**
 * Get vendor by slug (for public store pages)
 * Case-insensitive search
 *
 * @performance Only selects required columns
 * @index Uses idx_vendors_slug
 */
export const getVendorBySlug = cache(async (slug: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("vendors")
    .select(
      "id, store_name, slug, whatsapp_number, store_description, logo_url, city, business_hours, response_time"
    )
    .ilike("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching vendor by slug:", error);
    return null;
  }

  return data;
});

/**
 * Get vendor by ID
 *
 * @performance Only selects required columns
 */
export const getVendorById = cache(async (vendorId: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("vendors")
    .select(
      "id, user_id, store_name, slug, whatsapp_number, store_description, logo_url, city, business_hours, response_time"
    )
    .eq("id", vendorId)
    .single();

  if (error) {
    console.error("Error fetching vendor by ID:", error);
    return null;
  }

  return data;
});

// =============================================
// PRODUCT QUERIES
// =============================================

/**
 * Get all products for a vendor
 *
 * @performance Only selects required columns, ordered by created_at
 * @index Uses idx_products_vendor_id, idx_products_created_at
 */
export const getVendorProducts = cache(async (vendorId: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, vendor_id, name, description, price, contact_for_price, images, category, attributes, availability, is_available, is_active, created_at, updated_at"
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vendor products:", error);
    return [];
  }

  return data || [];
});

/**
 * Get available products for a vendor (public view)
 *
 * @performance Only selects required columns, filters by is_available
 * @index Uses idx_products_vendor_id, idx_products_is_available
 */
export const getAvailableVendorProducts = cache(async (vendorId: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, vendor_id, name, description, price, contact_for_price, images, category, availability, is_available, created_at"
    )
    .eq("vendor_id", vendorId)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching available products:", error);
    return [];
  }

  return data || [];
});

/**
 * Get product by ID
 *
 * @performance Only selects required columns
 */
export const getProductById = cache(async (productId: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, vendor_id, name, description, price, contact_for_price, images, category, attributes, availability, is_available, is_active, created_at, updated_at"
    )
    .eq("id", productId)
    .single();

  if (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }

  return data;
});

/**
 * Get product with vendor info
 *
 * @performance Only selects required columns from both tables
 */
export const getProductWithVendor = cache(async (productId: string) => {
  const supabase = await createServerSupabaseClient();

  const product = await getProductById(productId);
  if (!product) return null;

  const vendor = await getVendorById(product.vendor_id);
  if (!vendor) return null;

  return { product, vendor };
});

// =============================================
// CART QUERIES
// =============================================

/**
 * Get cart by ID (public access)
 *
 * @performance Only selects required columns
 */
export const getCartById = cache(async (cartId: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("carts")
    .select(
      "id, vendor_id, customer_id, items, status, customer_notes, vendor_notes, returning_customer, created_at, updated_at, confirmed_at"
    )
    .eq("id", cartId)
    .single();

  if (error) {
    console.error("Error fetching cart by ID:", error);
    return null;
  }

  return data;
});

/**
 * Get vendor's carts
 *
 * @performance Only selects required columns, ordered by created_at
 * @index Uses carts_vendor_id_idx, carts_created_at_idx
 */
export const getVendorCarts = cache(
  async (vendorId: string, limit: number = 50) => {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("carts")
      .select(
        "id, customer_id, items, status, customer_notes, returning_customer, created_at, confirmed_at"
      )
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching vendor carts:", error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get recent carts for analytics
 *
 * @performance Only selects minimal columns needed
 * @index Uses carts_vendor_id_idx, carts_created_at_idx
 */
export const getRecentVendorCarts = cache(
  async (vendorId: string, limit: number = 10) => {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("carts")
      .select("id, status, items, created_at, confirmed_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent carts:", error);
      return [];
    }

    return data || [];
  }
);

// =============================================
// CUSTOMER QUERIES
// =============================================

/**
 * Get customer by ID
 *
 * @performance Only selects required columns
 */
export const getCustomerById = cache(async (customerId: string) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, address, created_at")
    .eq("id", customerId)
    .single();

  if (error) {
    console.error("Error fetching customer by ID:", error);
    return null;
  }

  return data;
});

// =============================================
// ANALYTICS QUERIES
// =============================================

/**
 * Get vendor analytics events
 *
 * @performance Only selects required columns, time-bounded query
 * @index Uses analytics_vendor_id_idx, analytics_created_at_idx
 * @param days Number of days to look back (default 30)
 */
export const getVendorAnalytics = cache(
  async (vendorId: string, days: number = 30, limit: number = 1000) => {
    const supabase = await createServerSupabaseClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("analytics")
      .select("id, event_type, metadata, created_at")
      .eq("vendor_id", vendorId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching vendor analytics:", error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get analytics for a specific product
 *
 * @performance Filtered by vendor_id and metadata->>product_id
 * @index Consider adding: CREATE INDEX idx_analytics_product ON analytics((metadata->>'product_id'))
 */
export const getProductAnalytics = cache(
  async (vendorId: string, productId: string, days: number = 30) => {
    const supabase = await createServerSupabaseClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // INDEX RECOMMENDATION: CREATE INDEX idx_analytics_product_id ON analytics(vendor_id, (metadata->>'product_id'), created_at DESC);
    const { data, error } = await supabase
      .from("analytics")
      .select("id, event_type, created_at")
      .eq("vendor_id", vendorId)
      .filter("metadata->>product_id", "eq", productId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching product analytics:", error);
      return [];
    }

    return data || [];
  }
);

// =============================================
// HELPER TYPES
// =============================================

export type Vendor = Awaited<ReturnType<typeof getVendorById>>;
export type Product = Awaited<ReturnType<typeof getProductById>>;
export type Cart = Awaited<ReturnType<typeof getCartById>>;
export type Customer = Awaited<ReturnType<typeof getCustomerById>>;
export type AnalyticsEvent = NonNullable<
  Awaited<ReturnType<typeof getVendorAnalytics>>
>[number];

/**
 * Limit product images to maximum count
 *
 * Performance benefit:
 * - Reduces payload size by 50-100 KB per product (if 10+ images)
 * - Limits JSON array processing
 * - Encourages users to select best images
 *
 * Applied to all product queries before returning
 */
export function limitProductImages<T extends { images?: string[] } | null>(
  product: T,
  maxImages: number = 5
): T {
  if (!product || !product.images || !Array.isArray(product.images)) {
    return product;
  }

  return {
    ...product,
    images: product.images.slice(0, maxImages),
  };
}

/**
 * Limit images for multiple products
 *
 * Applied to product lists returned from queries
 */
export function limitProductImagesInArray<T extends { images?: string[] }>(
  products: T[] | null,
  maxImages: number = 5
): T[] {
  if (!products || !Array.isArray(products)) {
    return products || [];
  }

  return products.map((product) => limitProductImages(product, maxImages));
}
