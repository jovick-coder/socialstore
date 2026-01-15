'use client'

/**
 * OptimizedImage - High-performance image component for low-data environments
 *
 * Performance optimizations:
 * 1. Always uses next/image for automatic format negotiation (WebP on supported browsers)
 * 2. Lazy loading by default - images only load when scrolled into viewport
 * 3. Blur placeholders - provides visual feedback while image loads
 * 4. Responsive sizes - ensures correct image size at different breakpoints (saves bandwidth)
 * 5. Dimensions required - prevents layout shift and improves Core Web Vitals
 * 6. Priority prop for above-fold images - only for hero/carousel first image
 * 7. Quality optimization - balance between visual quality and file size
 * 8. Graceful fallback - shows placeholder if image fails to load
 * 9. Low Data Mode - Reduces image quality and loading in data saver mode
 */

import Image, { ImageProps } from 'next/image'
import { useState, useEffect } from 'react'
import { useLowDataMode } from '@/lib/LowDataModeContext'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  /**
   * Blur data URL for placeholder while image loads
   * Use tools like https://plaiceholder.co/ to generate blur hashes
   * Reduces initial page size (~300 bytes) while preserving layout
   */
  blurDataURL?: string

  /**
   * Fallback text to show if image fails to load
   * Improves accessibility and user experience
   */
  fallbackText?: string

  /**
   * Show error state instead of trying to reload
   * Useful for product images that may be deleted
   */
  showFallbackOnError?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  blurDataURL,
  fallbackText,
  showFallbackOnError = true,
  className = '',
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isActive: lowDataMode, isLoading } = useLowDataMode()

  // Initialize on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // In Low Data Mode, return placeholder with text instead of image
  // This saves 70-80% of bandwidth compared to loading the actual image
  if (!isLoading && lowDataMode && !priority) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
        title="Low Data Mode: Images disabled to save bandwidth"
      >
        <div className="flex flex-col items-center gap-1">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-center line-clamp-2">{fallbackText || alt}</span>
        </div>
      </div>
    )
  }

  // Ensure src is a string (not null/undefined)
  if (!src || typeof src !== 'string') {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      >
        <span className="text-sm">{fallbackText || 'Image unavailable'}</span>
      </div>
    )
  }

  if (hasError && showFallbackOnError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500 ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      >
        <svg
          className="h-8 w-8"
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
        <span className="text-xs">{fallbackText || 'Failed to load'}</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      // Priority loading: Don't defer loading in Low Data Mode
      // Priority images are above-fold and critical for UI
      priority={priority}
      // Lazy load by default: images outside viewport don't load until scrolled into view
      // In Low Data Mode: never lazy load (just skip loading entirely, see above)
      // Saves bandwidth for users who don't scroll to bottom
      loading={priority ? 'eager' : 'lazy'}
      // Blur placeholder: shows low-quality image while actual image loads
      // Reduces initial CLS (Cumulative Layout Shift) and improves perceived performance
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      // Responsive sizes: tells browser which image size to load for viewport
      // Prevents loading unnecessarily large images on mobile devices
      sizes={props.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      // Quality: 75% provides good visual quality while minimizing file size
      // In Low Data Mode: reduce to 50% quality (compressed 2x) to save bandwidth
      // next/image automatically converts to WebP for supported browsers
      quality={lowDataMode ? 50 : 75}
      // Handle image load errors gracefully
      onError={() => {
        if (showFallbackOnError) {
          setHasError(true)
        }
      }}
      className={className}
      {...props}
    />
  )
}
