import DashboardShell from './DashboardShell'

/**
 * SERVER COMPONENT LAYOUT
 *
 * Architecture Change:
 * - Removed 'use client' directive
 * - This is now a pure server component
 * - Can use server-only features (cookies, direct DB access, etc.)
 *
 * Performance Impact:
 * 1. Layout never re-renders on client-side navigation
 * 2. Server renders once per request, client renders on mount only
 * 3. Reduces TBT by eliminating React reconciliation at layout level
 * 4. Enables more aggressive caching strategies
 *
 * Client Shell Strategy:
 * - All client-only state moved to DashboardShell
 * - Layout is cached by server, shell is cached by browser
 * - Result: Dashboard feels like a native SPA
 *
 * This pattern works because:
 * - Sidebar state (open/closed) doesn't need to be shared with server
 * - All data fetching happens in page components
 * - Navigation state is managed by Next.js router
 * - Layout structure never changes, only content does
 */

export const metadata = {
  title: 'Dashboard | SocialStore',
  description: 'Manage your store and inventory',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
