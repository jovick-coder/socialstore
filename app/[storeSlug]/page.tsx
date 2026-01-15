/**
 * Store Page - Public Store Front (Performance Optimized)
 * 
 * Performance features:
 * - ISR with 120 second revalidation (stores don't change often)
 * - Server-side rendering for public access
 * - Optimized image loading with Next/Image
 * - Minimal client-side JavaScript
 */

import { notFound } from 'next/navigation'
import { createPublicSupabaseClient } from '@/lib/supabase/public'
import { Metadata } from 'next'
import StoreClient from '@/components/StoreClient'
import BackButton from '@/components/BackButton'
import VendorHeader from '@/components/VendorHeader'
import { headers } from 'next/headers'

// Enable ISR - cache for 2 minutes (stores update infrequently)
export const revalidate = 120

interface StorePageProps {
  params: Promise<{
    storeSlug: string
  }>
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata(
  { params }: StorePageProps
): Promise<Metadata> {
  const { storeSlug } = await params
  const supabase = await createPublicSupabaseClient()

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .ilike('slug', storeSlug) // Case-insensitive search
    .single()

  if (!vendor) {
    return {
      title: 'Store Not Found | SocialStore',
    }
  }

  // Get product count and first product image for preview
  const { data: products = [] } = await supabase
    .from('products')
    .select('images')
    .eq('vendor_id', vendor.id)
    .eq('is_available', true)
    .limit(1)

  const firstProductImage =
    products && products.length > 0 && products[0].images?.length > 0
      ? products[0].images[0]
      : null
  // Get host from headers (server-side)
  const headersList = await headers()
  const host = headersList.get('host')
  const storeUrl = `${host ? `https://${host}` : process.env.NEXT_PUBLIC_APP_URL}/${vendor.slug}`
  const description =
    vendor.description ||
    `Shop at ${vendor.store_name} on SocialStore. Browse our collection and order via WhatsApp. Fast delivery and excellent customer service.`

  return {
    title: `${vendor.store_name} - Shop Online | SocialStore`,
    description,
    keywords: [
      vendor.store_name,
      'online shopping',
      'WhatsApp store',
      'buy online',
      'e-commerce',
      'Nigeria shopping',
    ],
    authors: [{ name: vendor.store_name }],
    creator: vendor.store_name,
    publisher: 'SocialStore',
    metadataBase: new URL(host ? `https://${host}` : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    alternates: {
      canonical: storeUrl,
    },
    openGraph: {
      title: `${vendor.store_name} - Shop Online`,
      description,
      type: 'website',
      url: storeUrl,
      siteName: 'SocialStore',
      images: firstProductImage
        ? [
          {
            url: firstProductImage,
            width: 1200,
            height: 630,
            alt: `${vendor.store_name} products`,
          },
        ]
        : [],
      locale: 'en_NG',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${vendor.store_name} - Shop Online`,
      description,
      images: firstProductImage ? [firstProductImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params
  const supabase = await createPublicSupabaseClient()

  // Get vendor - use public client for unauthenticated access
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .ilike('slug', storeSlug) // Case-insensitive search
    .single()

  if (vendorError || !vendor) {
    notFound()
  }

  // Get available products
  const { data: products = [] } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BackButton />
        </div>
      </div>

      {/* Vendor Header with Business Information */}
      <VendorHeader
        storeName={vendor.store_name}
        logoUrl={vendor.logo_url}
        city={vendor.city}
        businessHours={vendor.business_hours}
        responseTime={vendor.response_time}
        whatsappNumber={vendor.whatsapp_number}
        description={vendor.description}
      />

      {/* Products Section */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {products && products.length > 0 ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
              <p className="mt-1 text-sm text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
            <StoreClient vendor={vendor} products={products} />
          </div>
        ) : (
          /* Empty State */
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H2.25c-.621 0-1.125.504-1.125 1.125v1.625c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No products available</h3>
              <p className="mt-1 text-sm text-gray-600">
                Check back soon for new products!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>
              Powered by{' '}
              <a href="/" className="font-medium text-green-600 hover:text-green-700">
                SocialStore
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
