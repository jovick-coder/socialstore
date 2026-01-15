"use server";

/**
 * Vendor Server Actions
 *
 * Performance: All database operations happen on the server
 * No client-side Supabase calls = reduced bundle size
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Update vendor profile information
 */
export async function updateVendorProfile(
  vendorId: string,
  data: {
    store_name: string;
    whatsapp_number: string;
    description: string;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("vendors")
      .update({
        store_name: data.store_name,
        whatsapp_number: data.whatsapp_number,
        description: data.description,
      })
      .eq("id", vendorId);

    if (error) throw error;

    // Revalidate profile and dashboard pages
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating vendor profile:", error);
    return { error: error.message || "Failed to update profile" };
  }
}

/**
 * Update vendor business information
 */
export async function updateVendorBusinessInfo(
  vendorId: string,
  data: {
    logo_url: string | null;
    city: string | null;
    business_hours: string | null;
    response_time: string | null;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("vendors")
      .update({
        logo_url: data.logo_url,
        city: data.city,
        business_hours: data.business_hours,
        response_time: data.response_time,
      })
      .eq("id", vendorId);

    if (error) throw error;

    // Revalidate profile and dashboard pages
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating vendor business info:", error);
    return { error: error.message || "Failed to update business information" };
  }
}
