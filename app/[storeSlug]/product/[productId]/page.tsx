/**
 * Product Detail Page - Server Component (Performance Optimized)
 * 
 * Performance features:
 * - ISR with 180 second revalidation
 * - All data fetched on server
 * - Optimized metadata for SEO and social sharing
 * - Minimal client-side JS
 */

import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import ProductDetailClient from '@/components/ProductDetailClient'
import BackButton from '@/components/BackButton'
import { headers } from 'next/headers'

// Enable ISR - product details cached for 3 minutes
export const revalidate = 180

interface ProductDetailPageProps {
  params: Promise<{
    storeSlug: string
    productId: string
  }>
}

/**
 * Generate dynamic metadata for product detail page
 */
export async function generateMetadata(
  { params }: ProductDetailPageProps
): Promise<Metadata> {
  const { storeSlug, productId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', storeSlug)
    .single()

  if (!vendor) {
    return {
      title: 'Product Not Found | SocialStore',
    }
  }

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('vendor_id', vendor.id)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found | SocialStore',
    }
  }
  // Get host from headers (server-side)
  const headersList = await headers()
  const host = headersList.get('host')
  const productImage = product.images && product.images.length > 0 ? product.images[0] : null
  const productUrl = `${host ? `https://${host}` : process.env.NEXT_PUBLIC_APP_URL}/${vendor.slug}/product/${product.id}`
  const description = product.description || `${product.name} - Available at ${vendor.store_name}`

  return {
    title: `${product.name} - ${vendor.store_name} | SocialStore`,
    description,
    openGraph: {
      title: `${product.name} - ${vendor.store_name}`,
      description,
      type: 'website',
      url: productUrl,
      images: productImage ? [{ url: productImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${vendor.store_name}`,
      description,
      images: productImage ? [productImage] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { storeSlug, productId } = await params
  const supabase = await createServerSupabaseClient()

  // Get vendor
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', storeSlug)
    .single()

  if (vendorError || !vendor) {
    notFound()
  }

  // Get product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('vendor_id', vendor.id)
    .single()

  if (productError || !product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <BackButton />
        </div>
      </div>

      {/* Product Detail */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductDetailClient product={product} vendor={vendor} />
      </main>
    </div>
  )
}
