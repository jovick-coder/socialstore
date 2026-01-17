'use client'

import { useState, memo, useActionState } from 'react'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

interface TopNavProps {
  onMenuClick: () => void
}

/**
 * PERFORMANCE: TopNav Component
 *
 * Architecture:
 * - Minimal state (dropdown open/close only)
 * - No data fetching or effects
 * - No router usage
 * - Memoized to prevent re-renders
 *
 * Rendering Strategy:
 * - Dropdown menu renders conditionally (not hidden)
 * - Prevents layout shift on mount
 * - Backdrop element is minimal (no expensive selectors)
 *
 * Animation: color and opacity only (no layout)
 * - Hover states use background-color (composited)
 * - No width/height/position changes
 * - No layout-triggering properties
 */
function TopNav({ onMenuClick }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logoutError, logoutAction, isPending] = useActionState(logout as any, { error: null as string | null })

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: Menu Button + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button - Only shows on lg breakpoint up */}
          <button
            onClick={onMenuClick}
            // PERFORMANCE: Only on mobile, uses CSS media query
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 duration-150"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Title - Static, no computation */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            {/* PERFORMANCE: Vendor name avoided to keep TopNav static */}
          </div>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative">
          {/* Dropdown Toggle Button - Color transitions only */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 duration-150"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar - Static, no dynamic content */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
              <span className="text-sm font-semibold text-white">S</span>
            </div>

            {/* Dropdown Chevron - Smooth rotation on state change */}
            <svg
              className="h-4 w-4 text-gray-600 transition-transform duration-150"
              style={{ transform: dropdownOpen ? 'scaleY(-1)' : 'scaleY(1)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* Dropdown Menu - Rendered conditionally to avoid hidden layout cost */}
          {dropdownOpen && (
            <>
              {/* Backdrop - Simple div, no expensive selectors */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
                // PERFORMANCE: No transition (instant close to feel responsive)
              />

              {/* Menu - Positioned absolutely (no layout impact on parent) */}
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                {/* Profile Link - Uses Next.js Link with prefetch for instant navigation */}
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  prefetch={true}
                  className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 duration-100"
                >
                  Profile Settings
                </Link>

                {/* Logout Button - Server action via form */}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full border-t px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Logging out...' : 'Log out'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// PERFORMANCE: memo prevents re-renders when layout updates
// onMenuClick is stable (memoized in DashboardShell)
export default memo(TopNav)
