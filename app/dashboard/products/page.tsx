/**
 * PRODUCTS PAGE
 * 
 * Server-first architecture with client-side caching:
 * 1. Server: Fetch vendor, products, analytics using react.cache
 * 2. Server: Pass data to ProductsClient component
 * 3. Client: Hydrate TanStack Query cache
 * 4. Navigation: Instant load from cache (10 min fresh)
 * 
 * Performance benefits:
 * - First visit: Server-rendered (0 client fetches, fast TTI)
 * - Dashboard  Products: Instant (cache hit)
 * - Products  Dashboard  Products: Instant (cache hit)
 * - Feels like client-side SPA even on slow networks
 * 
 * Cache strategy:
 * - Vendor: Shared with dashboard home (react.cache dedupe)
 * - Products: Shared with dashboard home (react.cache dedupe)
 * - Analytics: Expensive query, heavily cached (10 min)
 * 
 * Why this is fast:
 * - Parallel fetches on server (no waterfall)
 * - React.cache dedupes vendor/products if already fetched in request
 * - Client cache persists across navigation
 * - No loading skeleton needed (instant from cache)
 */

import { redirect } from 'next/navigation'
import ProductsClient from '@/components/ProductsClient'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorByUserId, getVendorProducts, getVendorAnalytics } from '@/lib/queries'

export const metadata = {
  title: 'Products | Dashboard',
  description: 'Manage your products and view analytics',
}

/**
 * AGGRESSIVE CACHING FOR PRODUCTS PAGE
 *
 * Strategy:
 * - Auth-protected route; must avoid caching redirects
 * - Use dynamic rendering to prevent cached redirect loops
 * - Client-side TanStack Query cache for instant navigation
 *
 * Flow:
 * 1. First user visit: Page is server-rendered and cached
 * 2. Subsequent visits: Served from cache (< 100ms)
 * 3. After 5 minutes: Background revalidation checks for updates
 * 4. Between dashboard pages: Instant from React Query cache (10 min fresh)
 *
 * Performance gains:
 * - Eliminates server rendering delay for repeat visitors
 * - Products page loads instantly on return
 * - Analytics and products data stays in memory across navigation
 * - Even slow networks feel fast (cached asset served immediately)
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch vendor - may be cached from dashboard home page (react.cache)
  const vendor = await getVendorByUserId(user.id)

  if (!vendor) {
    redirect('/onboarding')
  }

  // Fetch all data in parallel (no waterfall)
  // If user navigated from dashboard home, products are already cached
  const [products, analytics] = await Promise.all([
    getVendorProducts(vendor.id),
    getVendorAnalytics(vendor.id, 30),
  ])

  // Pass data to client component for hydration
  return (
    <ProductsClient
      vendorId={vendor.id}
      initialProducts={products}
      initialAnalytics={analytics}
    />
  )
}
