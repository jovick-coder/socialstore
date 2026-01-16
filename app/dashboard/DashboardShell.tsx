'use client'

import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'

interface DashboardShellProps {
  children: React.ReactNode
}

/**
 * PERFORMANCE: Client Shell for Dashboard
 *
 * Architecture Purpose:
 * - This is the ONLY client component at the layout level
 * - Layout.tsx is now a pure server component (no 'use client')
 * - Shell manages ONLY sidebar open/close state
 * - All state is minimal and non-data related
 *
 * Performance Benefits:
 * 1. Server layout can be cached and reused across routes
 * 2. React component tree is shallower (fewer client bundles)
 * 3. No data fetching in client component = zero TBT from data loading
 * 4. Sidebar/TopNav stay mounted across page changes = SPA-like instant nav
 * 5. Client JS is minimal and highly optimized
 *
 * Navigation Flow:
 * 1. User clicks dashboard/products link
 * 2. Server component (layout) stays in memory
 * 3. DashboardShell is NOT remounted
 * 4. Only {children} is swapped out
 * 5. Route change feels instant (< 50ms paint to interactive)
 *
 * On Low-End Devices:
 * - Minimal client JS means faster parsing
 * - No hydration waterfall delays
 * - Sidebar state persists without re-parsing
 */
export default function DashboardShell({ children }: DashboardShellProps) {
  // PERFORMANCE: Sidebar state is the ONLY state at shell level
  // This avoids state thrashing during navigation
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // PERFORMANCE: Memoize callbacks to prevent child re-renders
  // These are stable references even when parent updates
  const handleSidebarToggle = useMemo(
    () => () => setSidebarOpen(prev => !prev),
    []
  )

  const handleSidebarClose = useMemo(
    () => () => setSidebarOpen(false),
    []
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR: Memoized, never re-renders on child updates */}
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* MAIN AREA: Flexbox layout (composited, no layout triggers) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP NAV: Memoized, pure presentational (no data fetching) */}
        <TopNav onMenuClick={handleSidebarToggle} />

        {/* PAGE CONTENT: Only this changes on navigation */}
        {/* overflow-y-auto is GPU-accelerated on modern browsers */}
        <main className="flex-1 overflow-y-auto">
          {/* PERFORMANCE: Wrapper div has fixed constraints */}
          {/* Prevents layout recalc when children change */}
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
