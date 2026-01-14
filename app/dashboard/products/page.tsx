import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/whatsapp'
import Image from 'next/image'

export const metadata = {
  title: 'Products | Dashboard',
  description: 'Manage your products and view analytics',
}

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get vendor profile
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    redirect('/onboarding')
  }

  // Get all products
  const { data: products = [] } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  // Get product analytics
  const { data: analytics = [] } = await supabase
    .from('analytics')
    .select('metadata')
    .eq('vendor_id', vendor.id)
    .eq('event_type', 'product_click')

  // Count clicks per product
  const productClicks = (analytics || []).reduce((acc: Record<string, number>, event: any) => {
    const productId = event.metadata?.product_id
    if (productId) {
      acc[productId] = (acc[productId] || 0) + 1
    }
    return acc
  }, {})

  const productsList = products || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">
            Manage your products and view performance
          </p>
        </div>
        <Link
          href="/dashboard/add-product"
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {productsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {productsList.map((product: any) => {
                  const clicks = productClicks[product.id] || 0

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(product.price)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">{clicks}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.is_available ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="text-sm font-semibold text-green-600 hover:text-green-700"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/dashboard/edit-product?id=${product.id}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">No products yet</h3>
              <p className="mt-1 text-sm text-gray-600">
                Get started by adding your first product.
              </p>
              <Link
                href="/dashboard/add-product"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Product
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Product Stats */}
      {productsList.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{productsList.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Available</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {productsList.filter((p: any) => p.is_available).length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Clicks</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {Object.values(productClicks).reduce((sum: number, clicks: any) => sum + clicks, 0)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Most Clicked</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">
              {Math.max(...Object.values(productClicks), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
