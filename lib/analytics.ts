/**
 * Analytics Tracking Utilities
 * Track key events for vendor insights
 */

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AnalyticsEvent =
  | "store_view"
  | "product_click"
  | "cart_created"
  | "cart_confirmed"
  | "whatsapp_click";

export interface AnalyticsEventData {
  vendor_id: string;
  event_type: AnalyticsEvent;
  metadata?: Record<string, any>;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventData: AnalyticsEventData
): Promise<{ success: boolean; error: any }> {
  try {
    const supabase = createClient();

    console.log("Tracking event:", eventData);

    const { data, error } = await supabase
      .from("analytics")
      .insert({
        vendor_id: eventData.vendor_id,
        event_type: eventData.event_type,
        metadata: eventData.metadata || {},
      })
      .select();

    if (error) {
      console.error("Analytics tracking error:", error);
      return { success: false, error };
    }

    console.log("Event tracked successfully:", data);

    return { success: true, error: null };
  } catch (error) {
    console.error("Analytics tracking exception:", error);
    return { success: false, error };
  }
}

/**
 * Track store page view
 */
export async function trackStoreView(vendorId: string): Promise<void> {
  await trackEvent({
    vendor_id: vendorId,
    event_type: "store_view",
  });
}

/**
 * Track product click
 */
export async function trackProductClick(
  vendorId: string,
  productId: string,
  productName: string
): Promise<void> {
  await trackEvent({
    vendor_id: vendorId,
    event_type: "product_click",
    metadata: {
      product_id: productId,
      product_name: productName,
    },
  });
}

/**
 * Track cart creation
 */
export async function trackCartCreated(
  vendorId: string,
  cartId: string,
  itemCount: number,
  totalAmount: number
): Promise<void> {
  await trackEvent({
    vendor_id: vendorId,
    event_type: "cart_created",
    metadata: {
      cart_id: cartId,
      item_count: itemCount,
      total_amount: totalAmount,
    },
  });
}

/**
 * Track cart confirmation
 */
export async function trackCartConfirmed(
  vendorId: string,
  cartId: string,
  totalAmount: number
): Promise<void> {
  await trackEvent({
    vendor_id: vendorId,
    event_type: "cart_confirmed",
    metadata: {
      cart_id: cartId,
      total_amount: totalAmount,
    },
  });
}

/**
 * Track WhatsApp button click
 */
export async function trackWhatsAppClick(
  vendorId: string,
  source: "product" | "store" | "cart"
): Promise<void> {
  await trackEvent({
    vendor_id: vendorId,
    event_type: "whatsapp_click",
    metadata: {
      source,
    },
  });
}

/**
 * Get analytics summary for a vendor
 */
export async function getVendorAnalyticsSummary(
  vendorId: string,
  supabaseClient?: SupabaseClient
): Promise<{
  totalViews: number;
  totalProductClicks: number;
  totalCarts: number;
  totalConfirmedCarts: number;
  weeklyViews: number;
  weeklyCarts: number;
  error: any;
}> {
  const supabase = supabaseClient || createClient();

  // Get all-time stats
  const { data: allTimeData, error: allTimeError } = await supabase
    .from("analytics")
    .select("event_type")
    .eq("vendor_id", vendorId);

  // Get last 7 days stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: weeklyData, error: weeklyError } = await supabase
    .from("analytics")
    .select("event_type")
    .eq("vendor_id", vendorId)
    .gte("created_at", sevenDaysAgo.toISOString());

  if (allTimeError || weeklyError) {
    return {
      totalViews: 0,
      totalProductClicks: 0,
      totalCarts: 0,
      totalConfirmedCarts: 0,
      weeklyViews: 0,
      weeklyCarts: 0,
      error: allTimeError || weeklyError,
    };
  }

  const allTime = allTimeData || [];
  const weekly = weeklyData || [];

  return {
    totalViews: allTime.filter((e) => e.event_type === "store_view").length,
    totalProductClicks: allTime.filter((e) => e.event_type === "product_click")
      .length,
    totalCarts: allTime.filter((e) => e.event_type === "cart_created").length,
    totalConfirmedCarts: allTime.filter(
      (e) => e.event_type === "cart_confirmed"
    ).length,
    weeklyViews: weekly.filter((e) => e.event_type === "store_view").length,
    weeklyCarts: weekly.filter((e) => e.event_type === "cart_created").length,
    error: null,
  };
}

/**
 * Get daily analytics for chart visualization
 */
export async function getVendorDailyAnalytics(
  vendorId: string,
  days = 30,
  supabaseClient?: SupabaseClient
): Promise<{
  data: Array<{
    date: string;
    views: number;
    carts: number;
  }>;
  error: any;
}> {
  const supabase = supabaseClient || createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("analytics")
    .select("event_type, created_at")
    .eq("vendor_id", vendorId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) {
    return { data: [], error };
  }

  // Group by date
  const dailyStats = new Map<
    string,
    { date: string; views: number; carts: number }
  >();

  data.forEach((event) => {
    const date = new Date(event.created_at).toISOString().split("T")[0];

    if (!dailyStats.has(date)) {
      dailyStats.set(date, { date, views: 0, carts: 0 });
    }

    const stats = dailyStats.get(date)!;

    if (event.event_type === "store_view") {
      stats.views++;
    } else if (event.event_type === "cart_created") {
      stats.carts++;
    }
  });

  return {
    data: Array.from(dailyStats.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
    error: null,
  };
}
