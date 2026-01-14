'use client'

import Image from 'next/image'

interface VendorHeaderProps {
  storeName: string
  logoUrl?: string | null
  city?: string | null
  businessHours?: string | null
  responseTime?: string | null
  whatsappNumber: string
  description?: string | null
}

/**
 * Vendor information header displayed on public store page
 * Shows logo, store name, location, hours, and response time
 */
export default function VendorHeader({
  storeName,
  logoUrl,
  city,
  businessHours,
  responseTime,
  whatsappNumber,
  description,
}: VendorHeaderProps) {
  /**
   * Get store initials for fallback avatar
   */
  const getStoreInitials = () => {
    return storeName
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Header - Logo and Basic Info */}
        <div className="flex gap-6 mb-6">
          {/* Logo */}
          <div className="shrink-0">
            {logoUrl ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-gray-400">
                  {getStoreInitials()}
                </span>
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{storeName}</h1>

            {description && (
              <p className="mt-2 text-gray-600 line-clamp-2">{description}</p>
            )}

            {/* Trust Badges */}
            <div className="mt-4 flex flex-wrap gap-3">
              {/* Location Badge */}
              {city && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">{city}</span>
                </div>
              )}

              {/* Response Time Badge */}
              {responseTime && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-900">
                    Replies in {responseTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Hours (if available) */}
        {businessHours && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gray-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Business Hours</p>
                <p className="font-medium text-gray-900">{businessHours}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
