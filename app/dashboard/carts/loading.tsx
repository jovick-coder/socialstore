import { DashboardHeaderSkeleton, TableSkeleton } from '@/components/Skeletons'

export default function CartsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <DashboardHeaderSkeleton />

      {/* Carts table */}
      <TableSkeleton rows={10} />
    </div>
  )
}
