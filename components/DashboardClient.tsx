'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types/database'

interface DashboardClientProps {
  vendor: {
    id: string
    user_id: string
    store_name: string
    slug: string
    whatsapp_number: string
  }
  products: Product[]
  catalogLink: string
  catalogShareLink: string
  storeLink: string
}

export default function DashboardClient({
  vendor,
  products,
  catalogLink,
  catalogShareLink,
  storeLink,
}: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)

  /**
   * Filter products based on search query
   * Search in product name, description, and price
   */
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products
    }

    const query = searchQuery.toLowerCase().trim()

    return products.filter((product) => {
      const name = product.name.toLowerCase()
      const description = (product.description || '').toLowerCase()
      const price = product.price.toString()

      return name.includes(query) || description.includes(query) || price.includes(query)
    })
  }, [products, searchQuery])

  /**
   * Copy store link to clipboard
   */
  async function copyStoreLink() {
    try {
      await navigator.clipboard.writeText(storeLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <>
      {/* Store Link Card */}
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-green-900">Your Public Store Link</h2>
            <p className="mt-1 break-all font-mono text-sm text-green-700">{storeLink}</p>
          </div>
          <button
            onClick={copyStoreLink}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${copied
                ? 'bg-green-600 text-white'
                : 'bg-white text-green-600 hover:bg-green-100'
              }`}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
      {products.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">No products yet</h2>
            <p className="mt-2 text-gray-600">
              Start selling smarter today! Add your first product to create your catalog.
            </p>
            <Link
              href="/dashboard/add-product"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 hover:shadow-xl"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Your First Product
            </Link>
          </div>
        </div>
      ) : (
        /* Products Grid with Search */
        <div>
          {/* Search and Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search by name, description, or price..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 text-gray-600 bg-white pl-7 pr-7 py-2 text-sm placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Add Product Button */}
              <Link
                href="/dashboard/add-product"
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 whitespace-nowrap"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Product
              </Link>
            </div>
          </div>

          {/* Results Info */}
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              Found {filteredProducts.length} of {products.length} product
              {products.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Products Grid or Empty Search Results */}
          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  catalogLink={catalogLink}
                  whatsappNumber={vendor.whatsapp_number}
                />
              ))}
            </div>
          ) : (
            /* No Search Results */
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Try adjusting your search terms
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
