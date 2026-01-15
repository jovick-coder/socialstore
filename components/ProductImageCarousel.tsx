'use client'

/**
 * ProductImageCarousel - Client Component for Image Navigation
 * 
 * Performance: Minimal client JS - only for image carousel interaction
 */

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageCarouselProps {
  images: string[]
  productName: string
}

export default function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const hasMultipleImages = images.length > 1

  function handleNextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  function handlePrevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <>
      <Image
        src={images[currentImageIndex]}
        alt={`${productName} - Image ${currentImageIndex + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {hasMultipleImages && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Previous image"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Next image"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {currentImageIndex + 1}/{images.length}
          </div>
        </>
      )}
    </>
  )
}
