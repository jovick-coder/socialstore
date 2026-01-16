/**
 * Database types for the application
 */

export interface Vendor {
  id: string;
  user_id: string;
  store_name: string;
  slug: string;
  whatsapp_number: string;
  store_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  contact_for_price?: boolean;
  description: string | null;
  images: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: Vendor;
        Insert: Omit<Vendor, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Vendor, "id" | "created_at" | "updated_at">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
