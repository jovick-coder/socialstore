'use client'

import { useEffect, useState } from 'react'
import { getVendorDailyAnalytics } from '@/lib/analytics'
import { formatCurrency } from '@/lib/whatsapp'
import { calculateCartTotal, CartItem } from '@/lib/cart'

interface AnalyticsDashboardProps {
  vendorId: string
  analytics: {
    totalViews: number
    totalProductClicks: number
    totalCarts: number
    totalConfirmedCarts: number
    weeklyViews: number
    weeklyCarts: number
  }
  recentCarts: Array<{
    id: string
    items: CartItem[]
    status: string
    created_at: string
  }>
}

export default function AnalyticsDashboard({
  vendorId,
  analytics,
  recentCarts,
}: AnalyticsDashboardProps) {
  const [dailyData, setDailyData] = useState<
    Array<{ date: string; views: number; carts: number }>
  >([])

  useEffect(() => {
    async function fetchDailyData() {
      const { data } = await getVendorDailyAnalytics(vendorId, 30)
      setDailyData(data)
    }
    fetchDailyData()
  }, [vendorId])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Store Views */}
        <StatCard
          title="Total Store Views"
          value={analytics.totalViews}
          change={`${analytics.weeklyViews} this week`}
          icon="👀"
          color="blue"
        />

        {/* Product Clicks */}
        <StatCard
          title="Product Clicks"
          value={analytics.totalProductClicks}
          icon="🛍️"
          color="purple"
        />

        {/* Total Carts */}
        <StatCard
          title="Total Carts Created"
          value={analytics.totalCarts}
          change={`${analytics.weeklyCarts} this week`}
          icon="🛒"
          color="green"
        />

        {/* Confirmed Orders */}
        <StatCard
          title="Confirmed Orders"
          value={analytics.totalConfirmedCarts}
          icon="✅"
          color="emerald"
        />
      </div>

      {/* Conversion Rate */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Conversion Metrics
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600">View to Cart Rate</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {analytics.totalViews > 0
                ? ((analytics.totalCarts / analytics.totalViews) * 100).toFixed(
                  1
                )
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cart Confirmation Rate</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {analytics.totalCarts > 0
                ? (
                  (analytics.totalConfirmedCarts / analytics.totalCarts) *
                  100
                ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overall Conversion</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {analytics.totalViews > 0
                ? (
                  (analytics.totalConfirmedCarts / analytics.totalViews) *
                  100
                ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Simple Daily Chart */}
      {dailyData.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Last 30 Days Activity
          </h3>
          <div className="space-y-2">
            {dailyData.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="w-20 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 rounded bg-blue-500"
                      style={{
                        width: `${Math.max(
                          (day.views / Math.max(...dailyData.map((d) => d.views))) *
                          100,
                          5
                        )}%`,
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {day.views} views
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className="h-6 rounded bg-green-500"
                      style={{
                        width: `${Math.max(
                          (day.carts / Math.max(...dailyData.map((d) => d.carts))) *
                          100,
                          5
                        )}%`,
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {day.carts} carts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Carts */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Carts ({recentCarts?.length})
        </h3>

        {recentCarts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b text-left text-sm text-gray-600">
                <tr>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {recentCarts.map((cart) => {
                  const items = cart.items as CartItem[]
                  const total = calculateCartTotal(items)
                  return (
                    <tr key={cart.id}>
                      <td className="py-3 text-gray-900">
                        {new Date(cart.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-600">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3 font-semibold text-gray-900">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={cart.status} />
                      </td>
                      <td className="py-3">
                        <a
                          href={`/cart/${cart.id}`}
                          className="text-green-600 hover:text-green-700"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No carts yet. Share your store link to get started!
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Stat Card Component
 */
function StatCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string
  value: number
  change?: string
  icon: string
  color: 'blue' | 'purple' | 'green' | 'emerald'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="mt-1 text-xs text-gray-500">{change}</p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const labels = {
    pending: 'Pending',
    reviewing: 'Reviewing',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}
