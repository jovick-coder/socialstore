import { redirect } from 'next/navigation'
import { getVendorAnalyticsSummary } from '@/lib/analytics'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getVendorByUserId, getVendorAnalytics, getRecentVendorCarts } from '@/lib/queries'

export const metadata = {
  title: 'Analytics | Dashboard',
  description: 'View your store analytics and insights',
}

// Revalidate every minute for fresh analytics
export const revalidate = 60

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get vendor profile - cached query
  const vendor = await getVendorByUserId(user.id)

  if (!vendor) {
    redirect('/onboarding')
  }

  // Get analytics summary
  const analytics = await getVendorAnalyticsSummary(vendor.id, supabase)

  // Get raw analytics for debugging - cached query, limited to last 30 days
  const rawAnalytics = await getVendorAnalytics(vendor.id, 30, 20)

  console.log('Raw analytics count:', rawAnalytics?.length)
  console.log('Raw analytics sample:', rawAnalytics?.slice(0, 3))
  console.log('Analytics summary:', analytics)

  // Get recent carts - cached query
  const recentCarts = await getRecentVendorCarts(vendor.id, 10)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track your store performance and customer engagement
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        vendorId={vendor.id}
        analytics={analytics}
        recentCarts={recentCarts}
      />
    </div>
  )
}
