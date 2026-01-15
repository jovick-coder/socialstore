/**
 * ProductCard - Server Component (Performance Optimized)
 * 
 * Performance improvements:
 * - Removed 'use client' directive - now renders on server
 * - No client-side state for image carousel (moved to separate client component)
 * - All product data is rendered server-side (faster initial load)
 * - Only interactive elements (buttons) are client components
 * - Reduced JavaScript bundle size significantly
 */

import Link from 'next/link'
import { Product } from '@/types/database'
import { formatCurrency } from '@/lib/whatsapp'
import ProductImageCarousel from './ProductImageCarousel'
import ProductCardActions from './ProductCardActions'

interface ProductCardProps {
  product: Product
  catalogLink: string
  whatsappNumber?: string
}

/**
 * ProductCard displays a single product
 * Server-rendered with minimal client-side interactivity
 */
export default function ProductCard({ product, catalogLink, whatsappNumber }: ProductCardProps) {
  const images = product.images && product.images.length > 0 ? product.images : []

  return (
    <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      {/* Product Image - Client component for carousel */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <ProductImageCarousel images={images} productName={product.name} />
      </div>

      {/* Product Info - Server rendered */}
      <div className="p-4">
        <Link
          href={`/dashboard/products/${product.id}`}
          // Prefetch product detail: high-intent navigation from product card
          // Next.js prefetches on hover, caching route data for instant navigation
          // Critical for slow networks: eliminates loading spinner on click
          prefetch={true}
          className="block hover:text-green-600 transition"
        >
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        </Link>

        {product.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          {product.contact_for_price ? (
            <span className="text-base font-semibold text-gray-900">Contact for Price</span>
          ) : (
            <span className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
          )}
        </div>

        {/* Interactive Actions - Client component */}
        <div className="mt-4">
          <ProductCardActions
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            productDescription={product.description}
            initialAvailability={product.is_available}
            catalogLink={catalogLink}
            whatsappNumber={whatsappNumber}
          />
        </div>
      </div>
    </div>
  )
}
