import { DashboardHeaderSkeleton, ProductCardSkeleton } from '@/components/Skeletons'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <DashboardHeaderSkeleton />

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="h-8 w-2/3 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>

      {/* Recent products */}
      <div className="space-y-4">
        <div className="h-6 w-1/3 rounded bg-gray-200"></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
