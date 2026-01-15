import { DashboardHeaderSkeleton, ProfileFormSkeleton } from '@/components/Skeletons'

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <DashboardHeaderSkeleton />

      {/* Profile form */}
      <ProfileFormSkeleton />
    </div>
  )
}
