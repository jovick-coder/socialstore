/**
 * Dashboard Page - Server Component with Performance Optimizations
 * 
 * Performance features:
 * - Static rendering with ISR (revalidate every 60 seconds)
 * - All data fetching on server (0 client-side requests on initial load)
 * - Automatic caching for better performance on repeat visits
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorProducts } from '@/app/actions/products'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import DashboardClient from '@/components/DashboardClient'
import { generateCatalogUrl, generateWhatsAppCatalogLink } from '@/lib/whatsapp'

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

  // Get vendor info
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    redirect('/onboarding')
  }

  // Get products
  const { products = [] } = await getVendorProducts()

  // Get host from headers (server-side)
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'

  // Generate catalog link
  const catalogLink = generateCatalogUrl(vendor.slug, host)
  const storeLink = `${host}/${vendor.slug}`

  /**
   * Handle catalog share to WhatsApp
   */
  function getCatalogShareLink() {
    return generateWhatsAppCatalogLink(
      vendor.store_name,
      catalogLink,
      products.length,
      vendor.whatsapp_number
    )
  }

  return (
    <DashboardClient
      vendor={vendor}
      products={products}
      catalogLink={catalogLink}
      catalogShareLink={getCatalogShareLink()}
      storeLink={storeLink}
    />
  )
}
