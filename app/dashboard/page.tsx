/**
 * Dashboard Page - Server Component with Performance Optimizations
 * 
 * Performance features:
 * - Static rendering with ISR (revalidate every 60 seconds)
 * - All data fetching on server (0 client-side requests on initial load)
 * - Automatic caching for better performance on repeat visits
 */

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import DashboardClient from '@/components/DashboardClient'
import { generateCatalogUrl, generateWhatsAppCatalogLink } from '@/lib/whatsapp'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorByUserId, getVendorProducts } from '@/lib/queries'

// Enable ISR (Incremental Static Regeneration)
// Page will be cached and revalidated every 60 seconds
export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get vendor info - cached query
  const vendor = await getVendorByUserId(user.id)

  if (!vendor) {
    redirect('/onboarding')
  }

  // TypeScript doesn't understand that redirect() never returns
  // At this point, vendor is guaranteed to be non-null
  const guaranteedVendor = vendor!

  // Get products - cached query
  const products = await getVendorProducts(guaranteedVendor.id)

  // Get host from headers (server-side)
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'

  // Generate catalog link
  const catalogLink = generateCatalogUrl(guaranteedVendor.slug, host)
  const storeLink = `${host}/${guaranteedVendor.slug}`

  /**
   * Handle catalog share to WhatsApp
   */
  function getCatalogShareLink() {
    return generateWhatsAppCatalogLink(
      guaranteedVendor.store_name,
      catalogLink,
      products.length,
      guaranteedVendor.whatsapp_number
    )
  }

  return (
    <DashboardClient
      vendor={guaranteedVendor}
      products={products}
      catalogLink={catalogLink}
      catalogShareLink={getCatalogShareLink()}
      storeLink={storeLink}
    />
  )
}
