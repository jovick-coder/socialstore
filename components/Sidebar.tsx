'use client'

import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import LowDataModeToggle from '@/components/LowDataModeToggle'
import { memo, useActionState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * PERFORMANCE: Navigation items are static (no route reads)
 * Precomputed outside component to avoid re-creation on renders
 */
const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 6.75c0-.621.504-1.125 1.125-1.125h2.25C13.496 5.625 14 6.129 14 6.75v13.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V6.75zm6.75 .75v12.75c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V7.5c0-.621-.504-1.125-1.125-1.125h-2.25c-.621 0-1.125.504-1.125 1.125z" />
      </svg>
    ),
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H2.25c-.621 0-1.125.504-1.125 1.125v1.625c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    name: 'Carts',
    href: '/dashboard/carts',
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.622 0 1.151.432 1.271 1.007l1.74 12.159c.125.847.645 1.574 1.332 1.82m0 0a1.5 1.5 0 1 0 3 0m0 0a1.5 1.5 0 1 0 3 0m0 0a1.5 1.5 0 1 0 3 0m0 0H21.75" />
      </svg>
    ),
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

/**
 * PERFORMANCE: Sidebar Component
 *
 * Key optimizations:
 * 1. Memoized to prevent re-renders when parent updates
 * 2. No useEffect tied to route changes
 * 3. No DOM measurements (getBoundingClientRect, offsetHeight, etc.)
 * 4. Animation only uses composited properties (transform, opacity)
 * 5. Link prefetch enabled for instant navigation
 * 6. useActionState for server action handling (no async overhead)
 *
 * Mobile Drawer Performance:
 * - transform: translateX for open/close (GPU-accelerated)
 * - Backdrop opacity change only (no layout recalc)
 * - No height/width animations (triggers reflow)
 *
 * Navigation Flow:
 * - User clicks a link  onClick closes drawer
 * - Link prefetch starts immediately
 * - Next.js router handles navigation
 * - Sidebar stays mounted, only children swap
 * - Zero re-render of Sidebar component
 */
function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [logoutError, logoutAction, isPending] = useActionState(logout as any, { error: null as string | null })

  return (
    <>
      {/* MOBILE BACKDROP - Only opacity changes (composited) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          // PERFORMANCE: Opacity-only transition, no layout impact
          style={{ transition: 'opacity 200ms ease-in-out' }}
        />
      )}

      {/* SIDEBAR CONTAINER - Uses transform for smooth, GPU-accelerated animation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        // PERFORMANCE: transform is GPU-accelerated on all browsers
        // Avoids forced reflows that would occur with left/margin changes
        style={{
          transition: isOpen ? 'transform 300ms ease-out' : 'transform 200ms ease-in',
          willChange: 'transform',
        }}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section - Static, no recalc */}
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">SocialStore</h1>
          </div>

          {/* Navigation Links - Prefetch enabled for instant route change */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                prefetch={true}
                // PERFORMANCE: transition-colors only (no layout triggers)
                // Hover state is color-based, not position/size based
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 duration-150"
              >
                <item.icon
                  className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600 duration-150"
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Low Data Mode Toggle */}
          <div className="border-t px-3 py-4">
            <LowDataModeToggle />
          </div>

          {/* Logout Button - Server action, no hydration delays */}
          <div className="border-t px-3 py-4">
            <form action={logoutAction}>
              <button
                type="submit"
                disabled={isPending}
                // PERFORMANCE: transition-colors, opacity only (no layout)
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isPending ? 'Logging out...' : 'Log out'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

// PERFORMANCE: memo prevents re-render when parent updates but props are stable
// Props (isOpen, onClose) are stable references from DashboardShell (useMemo)
export default memo(Sidebar)
