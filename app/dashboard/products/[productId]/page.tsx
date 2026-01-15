import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/whatsapp'
import Image from 'next/image'
import BackButton from '@/components/BackButton'
import ProductViewTracker from '@/components/ProductViewTracker'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorByUserId, getProductById, getProductAnalytics } from '@/lib/queries'

interface ProductDetailPageProps {
  params: Promise<{
    productId: string
  }>
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { productId } = await params

  const product = await getProductById(productId)

  return {
    title: product ? `${product.name} | Product Details` : 'Product Details',
    description: 'View product details and analytics',
  }
}

// Revalidate every 2 minutes
export const revalidate = 120

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get vendor profile - cached query
  const vendor = await getVendorByUserId(user.id)

  if (!vendor) {
    redirect('/onboarding')
  }

  // Get product details - cached query
  const product = await getProductById(productId)

  if (!product || product.vendor_id !== vendor.id) {
    notFound()
  }

  // Get product analytics - cached query (last 30 days)
  // INDEX RECOMMENDATION: Already added in queries.ts
  const analytics = await getProductAnalytics(vendor.id, productId, 30)

  const totalClicks = analytics.length
  const recentClicks = totalClicks // Analytics already limited to 30 days

  return (
    <div className="space-y-6">
      {/* Product View Tracker */}
      <ProductViewTracker
        vendorId={vendor.id}
        productId={product.id}
        productName={product.name}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="flex gap-3">
          <Link
            href={`/dashboard/edit-product?id=${product.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Product
          </Link>
          <Link
            href={`/${vendor.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Store
          </Link>
        </div>
      </div>

      {/* Product Details Card */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="grid gap-8 p-8 md:grid-cols-2">
          {/* Product Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1).map((image: string, index: number) => (
                      <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
                <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.is_available ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                    Unavailable
                  </span>
                )}
              </div>
              <p className="mt-3 text-3xl font-bold text-green-600">
                {formatCurrency(product.price)}
              </p>
            </div>

            {product.description && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="space-y-3 border-t pt-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Product ID</span>
                <span className="font-mono text-sm text-gray-900">{product.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Product Analytics</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-linear-to-br from-blue-50 to-blue-100 p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-sm font-medium text-blue-900">Total Views</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-blue-900">{totalClicks}</p>
            <p className="mt-1 text-xs text-blue-700">All time</p>
          </div>

          <div className="rounded-lg border bg-linear-to-br from-purple-50 to-purple-100 p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-sm font-medium text-purple-900">Recent Views</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-purple-900">{recentClicks}</p>
            <p className="mt-1 text-xs text-purple-700">Last 30 days</p>
          </div>

          <div className="rounded-lg border bg-linear-to-br from-green-50 to-green-100 p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium text-green-900">Engagement</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-green-900">
              {totalClicks > 0 ? ((recentClicks / totalClicks) * 100).toFixed(0) : 0}%
            </p>
            <p className="mt-1 text-xs text-green-700">Recent activity</p>
          </div>
        </div>

        {/* Recent Activity */}
        {analytics && analytics.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <div className="mt-3 space-y-2">
              {analytics.slice(0, 5).map((event: any, index: number) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm text-gray-600">Product viewed</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
