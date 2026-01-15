/**
 * Reusable Skeleton Components
 * Mobile-first, TailwindCSS only, no layout shift
 */

/**
 * Animated skeleton pulse effect
 * Add this to any element that needs a loading state
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Text skeleton - single line
 */
export function TextSkeleton({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-4 rounded ${className}`} />
}

/**
 * Heading skeleton
 */
export function HeadingSkeleton({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const heightClass = size === 'lg' ? 'h-8' : 'h-6'
  return <Skeleton className={`${heightClass} rounded w-3/4`} />
}

/**
 * Image skeleton - maintains aspect ratio
 */
export function ImageSkeleton({
  className = '',
  aspectRatio = 'square',
}: {
  className?: string
  aspectRatio?: 'square' | 'video'
}) {
  const ratioClass =
    aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'
  return (
    <Skeleton className={`w-full ${ratioClass} rounded-lg ${className}`} />
  )
}

/**
 * Button skeleton
 */
export function ButtonSkeleton({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-10 rounded-lg ${className}`} />
}

/**
 * Card skeleton
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 sm:p-6 ${className}`}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>
    </div>
  )
}

/**
 * Product card skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <ImageSkeleton />
      </div>

      {/* Content */}
      <div className="space-y-3 p-4 sm:p-5">
        {/* Product name */}
        <Skeleton className="h-5 w-4/5 rounded" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>

        {/* Price */}
        <Skeleton className="h-6 w-1/3 rounded" />

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/**
 * Vendor header skeleton
 */
export function VendorHeaderSkeleton() {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Logo and store name row */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Skeleton className="h-16 w-16 rounded-lg sm:h-20 sm:w-20" />

          {/* Store name and details */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-4 w-2/5 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>
    </div>
  )
}

/**
 * Store page skeleton - full layout
 */
export function StorePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button area */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-6 w-24 rounded" />
        </div>
      </div>

      {/* Vendor header */}
      <VendorHeaderSkeleton />

      {/* Products section */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-1/3 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>

        {/* Products grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </main>

      {/* Footer placeholder */}
      <div className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl space-y-3 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/5 rounded" />
        </div>
      </div>
    </div>
  )
}

/**
 * Product detail page skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-24 rounded" />
        </div>
      </div>

      {/* Product detail */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product image */}
          <div className="space-y-4">
            <ImageSkeleton aspectRatio="square" className="rounded-lg" />

            {/* Image thumbnails */}
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-square h-16 rounded-lg w-16 sm:h-20 sm:w-20"
                />
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {/* Product name */}
            <Skeleton className="h-7 w-3/4 rounded" />

            {/* Rating/vendor */}
            <Skeleton className="h-4 w-1/2 rounded" />

            {/* Price */}
            <Skeleton className="h-8 w-1/3 rounded" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 rounded" />
              <Skeleton className="h-4 rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <ButtonSkeleton className="w-full" />
              <ButtonSkeleton className="w-full" />
            </div>

            {/* Additional info */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Dashboard header skeleton
 */
export function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3 rounded" />
        <ButtonSkeleton className="w-32" />
      </div>
      <Skeleton className="h-4 w-2/3 rounded" />
    </div>
  )
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Table header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 rounded" />
          ))}
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-4 sm:px-6">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton
                  key={j}
                  className={`h-4 rounded ${j === 0 ? 'w-1/2' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Analytics card skeleton
 */
export function AnalyticsCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <Skeleton className="mb-2 h-4 w-1/3 rounded" />
      <Skeleton className="h-8 w-1/2 rounded" />
      <Skeleton className="mt-4 h-24 rounded" />
    </div>
  )
}

/**
 * Profile form skeleton
 */
export function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <ButtonSkeleton className="w-full sm:w-1/4" />
    </div>
  )
}

/**
 * Cart skeleton
 */
export function CartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        {/* Cart items */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 pb-4">
              <Skeleton className="aspect-square h-20 w-20 rounded-lg sm:h-24 sm:w-24" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <Skeleton className="h-5 w-1/4 rounded" />
          <Skeleton className="h-5 w-1/4 rounded" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <ButtonSkeleton className="w-full" />
        <ButtonSkeleton className="w-full" />
      </div>
    </div>
  )
}
