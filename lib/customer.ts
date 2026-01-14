/**
 * Anonymous Customer Identification System
 *
 * Generates and persists a unique customer ID across sessions
 * without requiring authentication. Uses crypto.randomUUID() for unique identification.
 */

import { createClient } from "@/lib/supabase/client";

const CUSTOMER_ID_KEY = "socialstore_customer_id";
const CUSTOMER_PROFILE_KEY = "socialstore_customer_profile";

/**
 * Customer profile interface
 */
export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create a unique customer ID
 * Uses localStorage with cookie fallback for redundancy
 */
export function getOrCreateCustomerId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // Try to get from localStorage
  let customerId = localStorage.getItem(CUSTOMER_ID_KEY);

  if (customerId) {
    return customerId;
  }

  // Try to get from cookie
  customerId = getCookie(CUSTOMER_ID_KEY);

  if (customerId) {
    // Restore to localStorage
    localStorage.setItem(CUSTOMER_ID_KEY, customerId);
    return customerId;
  }

  // Generate new UUID using crypto.randomUUID()
  customerId = crypto.randomUUID();

  // Store in both localStorage and cookie
  localStorage.setItem(CUSTOMER_ID_KEY, customerId);
  setCookie(CUSTOMER_ID_KEY, customerId, 365); // 1 year expiry

  return customerId;
}

/**
 * Get customer ID (without creating if not exists)
 */
export function getCustomerId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem(CUSTOMER_ID_KEY) || getCookie(CUSTOMER_ID_KEY) || null
  );
}

/**
 * Fetch customer profile from Supabase
 */
export async function getCustomerProfile(
  customerId: string
): Promise<{ profile: CustomerProfile | null; error: any }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (expected for new customers)
      return { profile: null, error };
    }

    return { profile: data || null, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}

/**
 * Save or update customer profile in Supabase
 */
export async function saveCustomerProfile(
  customerId: string,
  profile: Omit<CustomerProfile, "id" | "created_at" | "updated_at">
): Promise<{ profile: CustomerProfile | null; error: any }> {
  try {
    const supabase = createClient();

    // Check if profile exists
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .single();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from("customers")
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId)
        .select()
        .single();

      return { profile: data, error };
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("customers")
        .insert({
          id: customerId,
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { profile: data, error };
    }
  } catch (error) {
    return { profile: null, error };
  }
}

/**
 * Save customer profile to localStorage cache
 * (for offline availability and faster access)
 */
export function cacheCustomerProfile(profile: CustomerProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Get cached customer profile from localStorage
 */
export function getCachedCustomerProfile(): CustomerProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CUSTOMER_PROFILE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Clear cached customer profile
 */
export function clearCachedCustomerProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CUSTOMER_PROFILE_KEY);
}

/**
 * Cookie helper functions
 */

function setCookie(name: string, value: string, days: number): void {
  if (typeof window === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return cookie.substring(nameEQ.length);
    }
  }

  return null;
}

/**
 * Clear all customer data (for debugging or user request)
 */
export function clearCustomerData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CUSTOMER_ID_KEY);
  localStorage.removeItem(CUSTOMER_PROFILE_KEY);
  setCookie(CUSTOMER_ID_KEY, "", -1); // Delete cookie
}

/**
 * Check if customer is returning (has valid profile)
 */
export async function isReturningCustomer(
  customerId: string
): Promise<boolean> {
  const { profile } = await getCustomerProfile(customerId);
  return !!profile;
}
