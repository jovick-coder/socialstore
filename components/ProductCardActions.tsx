'use client'

/**
 * ProductCardActions - Client Component for Interactive Elements
 * 
 * Performance: Minimal client JS - only button handlers
 * All product data is passed from server component as props
 */

import { useState } from 'react'
import { toggleProductAvailability, deleteProduct } from '@/app/actions/products'
import { generateWhatsAppProductLink } from '@/lib/whatsapp'

interface ProductCardActionsProps {
  productId: string
  productName: string
  productPrice: number
  productDescription: string | null
  initialAvailability: boolean
  catalogLink: string
  whatsappNumber?: string
}

export default function ProductCardActions({
  productId,
  productName,
  productPrice,
  productDescription,
  initialAvailability,
  catalogLink,
  whatsappNumber,
}: ProductCardActionsProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailability)
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleToggleAvailability() {
    setIsToggling(true)
    const newStatus = !isAvailable

    const result = await toggleProductAvailability(productId, newStatus)

    if (result.error) {
      alert('Failed to update availability: ' + result.error)
    } else {
      setIsAvailable(newStatus)
    }

    setIsToggling(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteProduct(productId)

    if (result.error) {
      alert('Failed to delete product: ' + result.error)
      setIsDeleting(false)
    }
  }

  function handleWhatsAppShare() {
    const url = generateWhatsAppProductLink(
      {
        name: productName,
        price: productPrice,
        description: productDescription,
      },
      catalogLink,
      whatsappNumber
    )

    window.open(url, '_blank')
  }

  return (
    <>
      {/* Actions Row */}
      <div className="flex items-center gap-2">
        {/* Availability Toggle */}
        <button
          onClick={handleToggleAvailability}
          disabled={isToggling}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${isAvailable
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {isToggling ? '...' : isAvailable ? '✓ Available' : 'Unavailable'}
        </button>

        {/* WhatsApp Share */}
        <button
          onClick={handleWhatsAppShare}
          className="rounded-lg bg-green-600 p-2 text-white transition hover:bg-green-700"
          title="Share on WhatsApp"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200 disabled:opacity-50"
          title="Delete product"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </>
  )
}
