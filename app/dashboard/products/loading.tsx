import { DashboardHeaderSkeleton, ProductCardSkeleton } from '@/components/Skeletons'

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <DashboardHeaderSkeleton />

      {/* Products grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
