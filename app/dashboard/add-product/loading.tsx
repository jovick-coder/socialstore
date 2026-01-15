import { DashboardHeaderSkeleton, ProfileFormSkeleton } from '@/components/Skeletons'

export default function AddProductLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <DashboardHeaderSkeleton />

      {/* Product form */}
      <ProfileFormSkeleton />
    </div>
  )
}
