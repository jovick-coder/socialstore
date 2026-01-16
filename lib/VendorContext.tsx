'use client';

/**
 * VENDOR CONTEXT
 * 
 * Provides vendor data across dashboard components without prop drilling.
 * This context is populated by server-fetched data and cached by TanStack Query.
 * 
 * Why use context:
 * - TopNav needs vendor data (store name, logo)
 * - Sidebar might need vendor data
 * - Dashboard pages have vendor data
 * - Avoid prop drilling through layout
 * 
 * Performance:
 * - Data comes from server initially (0 client fetches)
 * - Cached in TanStack Query (10 min staleTime)
 * - Context just distributes the data, doesn't fetch it
 */

import { createContext, useContext, ReactNode } from 'react';

interface VendorData {
  id: string;
  user_id: string;
  store_name: string;
  slug: string;
  whatsapp_number: string;
  store_description?: string | null;
  logo_url?: string | null;
  city?: string | null;
  business_hours?: any | null;
  response_time?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface VendorContextValue {
  vendor: VendorData | null;
}

const VendorContext = createContext<VendorContextValue>({ vendor: null });

export function VendorProvider({
  vendor,
  children,
}: {
  vendor: VendorData | null;
  children: ReactNode;
}) {
  return (
    <VendorContext.Provider value={{ vendor }}>
      {children}
    </VendorContext.Provider>
  );
}

/**
 * Hook to access vendor data in any dashboard component
 * 
 * Usage:
 * ```tsx
 * const { vendor } = useVendor();
 * ```
 */
export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within VendorProvider');
  }
  return context;
}
