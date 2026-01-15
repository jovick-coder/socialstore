import { DashboardHeaderSkeleton, ImageSkeleton, TableSkeleton } from '@/components/Skeletons'

export default function ProductDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="h-6 w-24 rounded bg-gray-200"></div>

      {/* Page header */}
      <DashboardHeaderSkeleton />

      {/* Product details grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Image section */}
        <div className="space-y-4 lg:col-span-1">
          <ImageSkeleton aspectRatio="square" className="rounded-lg" />
        </div>

        {/* Product info section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic info card */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 space-y-4">
            <div className="h-6 w-2/3 rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="h-4 w-1/2 rounded bg-gray-200 mb-2"></div>
                <div className="h-8 w-2/3 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics table */}
      <TableSkeleton rows={5} />
    </div>
  )
}
