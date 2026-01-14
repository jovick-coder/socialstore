import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getVendorAnalyticsSummary } from '@/lib/analytics'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export const metadata = {
  title: 'Analytics | Dashboard',
  description: 'View your store analytics and insights',
}

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get vendor profile
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    redirect('/onboarding')
  }

  // Get analytics summary
  const analytics = await getVendorAnalyticsSummary(vendor.id, supabase)

  // Debug: Check raw analytics data
  const { data: rawAnalytics, error: rawError } = await supabase
    .from('analytics')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .limit(20)

  console.log('Raw analytics count:', rawAnalytics?.length)
  console.log('Raw analytics sample:', rawAnalytics?.slice(0, 3))
  console.log('Analytics summary:', analytics)
  console.log('Raw error:', rawError)

  // Get recent carts
  const { data: recentCarts = [] } = await supabase
    .from('carts')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .limit(10)

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
        recentCarts={recentCarts || []}
      />
    </div>
  )
}
