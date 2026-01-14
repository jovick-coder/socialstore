'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/types/database'
import { toggleProductAvailability, deleteProduct } from '@/app/actions/products'
import { generateWhatsAppProductLink, formatCurrency } from '@/lib/whatsapp'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  catalogLink: string
  whatsappNumber?: string
}

/**
 * ProductCard component displays a single product with toggle, share, and delete actions
 */
export default function ProductCard({ product, catalogLink, whatsappNumber }: ProductCardProps) {
  const [isAvailable, setIsAvailable] = useState(product.is_available)
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product.images && product.images.length > 0 ? product.images : []
  const hasMultipleImages = images.length > 1

  /**
   * Handle next image
   */
  function handleNextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  /**
   * Handle previous image
   */
  function handlePrevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  /**
   * Handle availability toggle
   */
  async function handleToggleAvailability() {
    setIsToggling(true)
    const newStatus = !isAvailable

    const result = await toggleProductAvailability(product.id, newStatus)

    if (result.error) {
      alert('Failed to update availability: ' + result.error)
    } else {
      setIsAvailable(newStatus)
    }

    setIsToggling(false)
  }

  /**
   * Handle product deletion
   */
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteProduct(product.id)

    if (result.error) {
      alert('Failed to delete product: ' + result.error)
      setIsDeleting(false)
    }
    // If successful, component will be removed from DOM by revalidation
  }

  /**
   * Handle WhatsApp share
   */
  function handleWhatsAppShare() {
    const url = generateWhatsAppProductLink(
      {
        name: product.name,
        price: product.price,
        description: product.description,
      },
      catalogLink,
      whatsappNumber
    )

    window.open(url, '_blank')
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md
      
        `}
    >


      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Image Navigation Buttons (only show if multiple images) */}
            {hasMultipleImages && (
              <>
                {/* Previous Button */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                  aria-label="Previous image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                  aria-label="Next image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                  {currentImageIndex + 1}/{images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>  {!isAvailable && (
            <span className="rounded-lg text-red-600 text-sm font-semibold">
              Out of Stock
            </span>
          )}
        </div>
        <p className="mt-1 text-lg font-bold text-green-600">
          {formatCurrency(product.price)}
        </p>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 border space-y-2">
          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            disabled={isToggling}
            className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${isAvailable
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isToggling ? 'Updating...' : isAvailable ? '✓ In Stock' : 'Mark as Available'}
          </button>

          <div className="flex gap-1">
            {/* Share to WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-2 py-1 md:px-4 md:py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Share
            </button>

            {/* Edit Button */}
            <Link
              href={`/dashboard/edit-product?id=${product.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-300  px-2 py-1 md:px-4 md:py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg border border-red-300  px-2 py-1 md:px-4 md:py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
