import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorProducts } from '@/app/actions/products'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import DashboardClient from '@/components/DashboardClient'
import { generateCatalogUrl, generateWhatsAppCatalogLink } from '@/lib/whatsapp'

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
