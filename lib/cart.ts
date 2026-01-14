/**
 * Cart Management Utilities
 * Handles cart operations, calculations, and state management
 */

import { createClient } from "@/lib/supabase/client";

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Cart {
  id: string;
  vendor_id: string;
  items: CartItem[];
  status: "pending" | "reviewing" | "confirmed" | "cancelled";
  customer_name?: string;
  customer_phone?: string;
  customer_notes?: string;
  vendor_notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

/**
 * Calculate total items in cart
 */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculate cart subtotal
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Format currency (NGN)
 */
export function formatCartCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Add item to cart (local state helper)
 */
export function addToCart(
  currentCart: CartItem[],
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  }
): CartItem[] {
  const existingItemIndex = currentCart.findIndex(
    (item) => item.product_id === product.id
  );

  if (existingItemIndex > -1) {
    // Increase quantity if item already exists
    const updatedCart = [...currentCart];
    updatedCart[existingItemIndex] = {
      ...updatedCart[existingItemIndex],
      quantity: updatedCart[existingItemIndex].quantity + 1,
    };
    return updatedCart;
  } else {
    // Add new item
    return [
      ...currentCart,
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
      },
    ];
  }
}

/**
 * Remove item from cart
 */
export function removeFromCart(
  currentCart: CartItem[],
  productId: string
): CartItem[] {
  return currentCart.filter((item) => item.product_id !== productId);
}

/**
 * Update item quantity in cart
 */
export function updateCartItemQuantity(
  currentCart: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(currentCart, productId);
  }

  return currentCart.map((item) =>
    item.product_id === productId ? { ...item, quantity } : item
  );
}

/**
 * Create a new cart in Supabase
 */
export async function createCart(
  vendorId: string,
  items: CartItem[],
  customerId?: string,
  isReturning: boolean = false
): Promise<{ cart: Cart | null; error: any }> {
  const supabase = createClient();

  const insertData: any = {
    vendor_id: vendorId,
    items,
    status: "pending",
  };

  // Add customer_id and returning_customer if provided
  // (these fields may not exist in the database yet if migration hasn't been applied)
  if (customerId) {
    insertData.customer_id = customerId;
    insertData.returning_customer = isReturning;
  }

  const { data, error } = await supabase
    .from("carts")
    .insert(insertData)
    .select()
    .single();

  return { cart: data, error };
}

/**
 * Get cart by ID
 */
export async function getCart(
  cartId: string
): Promise<{ cart: Cart | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("id", cartId)
    .single();

  return { cart: data, error };
}

/**
 * Update cart status (vendor action)
 */
export async function updateCartStatus(
  cartId: string,
  status: Cart["status"],
  vendorNotes?: string
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient();

  const updateData: any = { status };

  if (vendorNotes !== undefined) {
    updateData.vendor_notes = vendorNotes;
  }

  if (status === "confirmed") {
    updateData.confirmed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("carts")
    .update(updateData)
    .eq("id", cartId);

  return { success: !error, error };
}

/**
 * Update cart items (vendor can modify quantities/availability)
 */
export async function updateCartItems(
  cartId: string,
  items: CartItem[]
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("carts")
    .update({ items })
    .eq("id", cartId);

  return { success: !error, error };
}

/**
 * Get vendor's recent carts
 */
export async function getVendorCarts(
  vendorId: string,
  limit = 50
): Promise<{ carts: Cart[]; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { carts: data || [], error };
}

/**
 * Get customer's last pending cart for a vendor (for cart recovery)
 * Only returns carts created within last 48 hours with status='pending'
 */
export async function getRecoverableCart(
  vendorId: string,
  customerId: string
): Promise<{ cart: Cart | null; error: any }> {
  const supabase = createClient();

  // Calculate 48 hours ago
  const fortyEightHoursAgo = new Date();
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("customer_id", customerId)
    .eq("status", "pending")
    .gte("created_at", fortyEightHoursAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // If no rows found, return null (not an error)
  if (error && error.code === "PGRST116") {
    return { cart: null, error: null };
  }

  return { cart: data, error };
}

/**
 * Generate cart summary text for WhatsApp
 */
export function generateCartSummary(items: CartItem[]): string {
  let summary = "";
  items.forEach((item, index) => {
    summary += `${index + 1}. ${item.name}\n   Qty: ${
      item.quantity
    } × ${formatCartCurrency(item.price)} = ${formatCartCurrency(
      item.price * item.quantity
    )}\n\n`;
  });
  return summary;
}

/**
 * Generate cart URL
 */
export function generateCartUrl(cartId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/cart/${cartId}`;
}

/**
 * Save or update draft cart in Supabase
 * Called when items are added/updated to preserve cart state
 */
export async function saveDraftCart(
  vendorId: string,
  items: CartItem[],
  customerId: string
): Promise<{ cart: Cart | null; error: any }> {
  const supabase = createClient();

  // First, try to find existing draft cart for this vendor and customer
  const { data: existingCart, error: fetchError } = await supabase
    .from("carts")
    .select("id")
    .eq("vendor_id", vendorId)
    .eq("customer_id", customerId)
    .eq("status", "draft")
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { cart: null, error: fetchError };
  }

  if (existingCart) {
    // Update existing draft cart
    const { data, error } = await supabase
      .from("carts")
      .update({
        items,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingCart.id)
      .select()
      .single();

    return { cart: data, error };
  } else {
    // Create new draft cart
    const { data, error } = await supabase
      .from("carts")
      .insert({
        vendor_id: vendorId,
        customer_id: customerId,
        items,
        status: "draft",
      })
      .select()
      .single();

    return { cart: data, error };
  }
}

/**
 * Get draft cart for recovery
 */
export async function getDraftCart(
  vendorId: string,
  customerId: string
): Promise<{ cart: Cart | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("customer_id", customerId)
    .eq("status", "draft")
    .maybeSingle();

  // If no rows found, return null (not an error)
  if (error && error.code === "PGRST116") {
    return { cart: null, error: null };
  }

  return { cart: data, error };
}

/**
 * Delete draft cart (called when user clicks "Start Fresh")
 */
export async function deleteDraftCart(
  cartId: string
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("carts")
      .delete()
      .eq("id", cartId)
      .select();

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error };
    }

    console.log("Delete response:", data);
    return { success: true, error: null };
  } catch (err) {
    console.error("Delete exception:", err);
    return { success: false, error: err };
  }
}

/**
 * Local storage helpers for cart persistence (client-side only)
 */
export const CartStorage = {
  /**
   * Save cart to localStorage
   */
  save(vendorId: string, items: CartItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`cart_${vendorId}`, JSON.stringify(items));
  },

  /**
   * Load cart from localStorage
   */
  load(vendorId: string): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(`cart_${vendorId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear cart from localStorage
   */
  clear(vendorId: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`cart_${vendorId}`);
  },
};
