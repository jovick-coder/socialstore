"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Generate a URL-friendly slug from store name
 */
function generateSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

/**
 * Check if a slug is already taken
 */
async function isSlugTaken(slug: string, supabase: any): Promise<boolean> {
  const { data } = await supabase
    .from("vendors")
    .select("id")
    .eq("slug", slug)
    .single();

  return !!data;
}

/**
 * Generate a unique slug by appending numbers if needed
 */
async function generateUniqueSlug(
  storeName: string,
  supabase: any
): Promise<string> {
  let slug = generateSlug(storeName);
  let counter = 1;

  while (await isSlugTaken(slug, supabase)) {
    slug = `${generateSlug(storeName)}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Server action to save vendor onboarding data
 */
export async function completeOnboarding(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;
  const storeDescription = formData.get("storeDescription") as string;

  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(storeName, supabase);

  // Save vendor data
  const { error } = await supabase.from("vendors").insert({
    user_id: user.id,
    store_name: storeName,
    slug: slug,
    whatsapp_number: whatsappNumber,
    store_description: storeDescription || null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
