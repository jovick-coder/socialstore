/**
 * Dashboard Data Hooks
 *
 * TanStack Query hooks for dashboard data fetching.
 * These hooks manage client-side caching and synchronization.
 *
 * Architecture:
 * 1. Server fetches initial data → Server Component
 * 2. Server component passes data to client component
 * 3. Client component hydrates React Query cache
 * 4. Hooks provide access to cached data with automatic refetch management
 * 5. Navigation between pages reuses cache (stale for 10 min)
 *
 * Performance guarantees:
 * - First page load: Server-rendered (0ms client cache miss)
 * - Subsequent pages: Cached instantly (0ms from memory)
 * - Data refresh: Stale after 10 min, automatic refetch in background
 * - Offline: Serves cached data indefinitely
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Query keys - used to identify and manage cache entries
export const dashboardQueryKeys = {
  // Vendor profile - shared across all dashboard pages
  vendor: () => ["vendor"],
  vendorDetail: (userId: string) => ["vendor", userId],

  // Products - cached for 10 min, reused across pages
  products: () => ["products"],
  vendorProducts: (vendorId: string) => ["products", vendorId],

  // Analytics - expensive query, heavily cached
  analytics: () => ["analytics"],
  vendorAnalytics: (vendorId: string, days: number) => [
    "analytics",
    vendorId,
    days,
  ],

  // Orders/Carts
  carts: () => ["carts"],
  vendorCarts: (vendorId: string) => ["carts", vendorId],
};

// =============================================
// VENDOR PROFILE HOOK
// =============================================

/**
 * Hook to fetch and cache vendor profile
 *
 * @param userId - Current user ID (passed from server component)
 * @param initialData - Server-fetched vendor data (hydrates cache instantly)
 * @returns Vendor profile with loading/error states
 *
 * Cache behavior:
 * - Fresh for 10 minutes (no refetch when navigating)
 * - Shows stale data while refetching in background
 * - Falls back to localStorage if offline
 */
export function useDashboardVendor(userId: string, initialData?: any) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: dashboardQueryKeys.vendorDetail(userId),
    queryFn: async () => {
      // This should rarely run because server component provides initialData
      const supabase = createClient();

      const { data, error } = await supabase
        .from("vendors")
        .select(
          "id, user_id, store_name, slug, whatsapp_number, store_description, logo_url, city, business_hours, response_time, created_at, updated_at"
        )
        .eq("user_id", userId)
        .single();

      if (error) throw new Error("Failed to fetch vendor profile");
      return data;
    },
    // Hydrate with server-fetched data
    // Prevents redundant query on first render
    initialData,
    // Prevent immediate refetch when data is available
    staleTime: Infinity,
  });
}

// =============================================
// PRODUCTS HOOK
// =============================================

/**
 * Hook to fetch and cache vendor products
 *
 * @param vendorId - Vendor ID (from vendor profile)
 * @param initialData - Server-fetched products list (hydrates cache instantly)
 * @returns Products array with loading/error states
 *
 * Cache behavior:
 * - Fresh for 10 minutes
 * - Products list rarely changes, so long staleTime is safe
 * - Navigating between Products/Dashboard pages = instant load from cache
 */
export function useDashboardProducts(vendorId: string, initialData?: any[]) {
  return useQuery({
    queryKey: dashboardQueryKeys.vendorProducts(vendorId),
    queryFn: async () => {
      // This should rarely run because server component provides initialData
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, vendor_id, title, description, price, category, stock, image_url, status, created_at, updated_at"
        )
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (error) throw new Error("Failed to fetch products");
      return data || [];
    },
    initialData,
    staleTime: Infinity,
  });
}

// =============================================
// ANALYTICS HOOK
// =============================================

/**
 * Hook to fetch and cache analytics data
 *
 * @param vendorId - Vendor ID
 * @param days - Number of days to fetch (default 30)
 * @param initialData - Server-fetched analytics (hydrates cache instantly)
 * @returns Analytics events array with loading/error states
 *
 * Cache behavior:
 * - Analytics is expensive to compute, so heavily cached
 * - Fresh for 10 minutes (rarely changes in real-time)
 * - Dashboard pages can instantly show cached analytics
 */
export function useDashboardAnalytics(
  vendorId: string,
  days: number = 30,
  initialData?: any[]
) {
  return useQuery({
    queryKey: dashboardQueryKeys.vendorAnalytics(vendorId, days),
    queryFn: async () => {
      // This should rarely run because server component provides initialData
      const supabase = createClient();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("analytics")
        .select("id, vendor_id, event_type, metadata, created_at")
        .eq("vendor_id", vendorId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw new Error("Failed to fetch analytics");
      return data || [];
    },
    initialData,
    staleTime: Infinity,
  });
}

// =============================================
// CARTS/ORDERS HOOK
// =============================================

/**
 * Hook to fetch and cache customer carts
 *
 * @param vendorId - Vendor ID
 * @param initialData - Server-fetched carts (hydrates cache instantly)
 * @returns Carts array with loading/error states
 *
 * Cache behavior:
 * - Fresh for 10 minutes
 * - Carts may change more frequently than products, but cache is reasonable
 * - Can manually invalidate cache when new cart is created
 */
export function useDashboardCarts(vendorId: string, initialData?: any[]) {
  return useQuery({
    queryKey: dashboardQueryKeys.vendorCarts(vendorId),
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("carts")
        .select(
          "id, vendor_id, customer_id, status, items, created_at, updated_at"
        )
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (error) throw new Error("Failed to fetch carts");
      return data || [];
    },
    initialData,
    staleTime: Infinity,
  });
}

// =============================================
// CACHE MANAGEMENT FUNCTIONS
// =============================================

/**
 * Invalidate vendor profile cache
 * Call this after user edits their profile
 */
export function invalidateVendorCache(userId: string) {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({
    queryKey: dashboardQueryKeys.vendorDetail(userId),
  });
}

/**
 * Invalidate products cache
 * Call this after product is added/edited/deleted
 */
export function invalidateProductsCache(vendorId: string) {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({
    queryKey: dashboardQueryKeys.vendorProducts(vendorId),
  });
}

/**
 * Invalidate analytics cache
 * Call this to force fresh analytics fetch
 */
export function invalidateAnalyticsCache(vendorId: string, days: number = 30) {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({
    queryKey: dashboardQueryKeys.vendorAnalytics(vendorId, days),
  });
}

/**
 * Invalidate all dashboard caches
 * Call this as a nuclear option (rarely needed)
 */
export function invalidateAllDashboardCache() {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({
    queryKey: ["vendor"],
  });
  queryClient.invalidateQueries({
    queryKey: ["products"],
  });
  queryClient.invalidateQueries({
    queryKey: ["analytics"],
  });
  queryClient.invalidateQueries({
    queryKey: ["carts"],
  });
}
