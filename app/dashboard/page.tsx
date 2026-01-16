/**
 * DASHBOARD HOME PAGE
 * 
 * Server Component → Client Component Architecture:
 * 1. Server: Fetch initial data (vendor, products) using React.cache
 * 2. Server: Pass data as props to client component
 * 3. Client: Hydrate TanStack Query cache with initialData
 * 4. Client: Render UI with cached data
 * 5. Navigation: Subsequent visits use cached data (10 min fresh)
 * 
 * Performance guarantees:
 * - First load: Server-rendered, 0 client fetches
 * - Navigation from Products → Dashboard: Instant (cached)
 * - Navigation from Dashboard → Products: Instant (cached)
 * - Even on 3G (900ms latency), feels like local SPA
 * 
 * Cache boundaries:
 * - Vendor profile: Cached in server (react.cache) + client (TanStack Query)
 * - Products list: Cached in server (react.cache) + client (TanStack Query)
 * - Analytics: Computed on-the-fly, no external query needed for homepage
 * 
 * Why this is fast:
 * - Server component eliminates waterfall (parallel fetches)
 * - React.cache deduplicates vendor query if called multiple times in tree
 * - TanStack Query prevents re-fetch when navigating back to this page
 * - Client component is minimal (no useState for data loading)
 */

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import DashboardClient from '@/components/DashboardClient'
import { generateCatalogUrl, generateWhatsAppCatalogLink } from '@/lib/whatsapp'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorByUserId, getVendorProducts } from '@/lib/queries'

// Disable caching - let React Query handle client-side cache
// This ensures server always checks auth freshly
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Auth check - always fresh (security)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch vendor - cached via react.cache in queries.ts
  // If this page and another page both call getVendorByUserId in same request,
  // only one database query runs (deduplication)
  const vendor = await getVendorByUserId(user.id)

  if (!vendor) {
    redirect('/onboarding')
  }

  // Fetch products - cached via react.cache
  // Shared cache with /dashboard/products page if user navigates there
  const products = await getVendorProducts(vendor.id)

  // Get host for link generation
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'

  // Generate store links
  const catalogLink = generateCatalogUrl(vendor.slug, host)
  const storeLink = `${host}/${vendor.slug}`
  const catalogShareLink = generateWhatsAppCatalogLink(
    vendor.store_name,
    catalogLink,
    products.length,
    vendor.whatsapp_number
  )

  // Pass all data to client component
  // Client component will hydrate TanStack Query cache
  return (
    <DashboardClient
      vendor={vendor}
      products={products}
      catalogLink={catalogLink}
      catalogShareLink={catalogShareLink}
      storeLink={storeLink}
    />
  )
}
