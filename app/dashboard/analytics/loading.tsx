import { DashboardHeaderSkeleton, AnalyticsCardSkeleton, TableSkeleton } from '@/components/Skeletons'

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <DashboardHeaderSkeleton />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <AnalyticsCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <AnalyticsCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent activity table */}
      <TableSkeleton rows={8} />
    </div>
  )
}
