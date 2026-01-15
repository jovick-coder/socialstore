'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/actions/auth'

interface TopNavProps {
  onMenuClick: () => void
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadVendor() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Only select columns needed for TopNav display
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id, store_name, logo_url')
          .eq('user_id', user.id)
          .single()

        setVendor(vendorData)
      }
    }

    loadVendor()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const result = await logout()
      if (result?.success && result?.redirectTo) {
        // Let server action handle redirect via redirect() call
        // More reliable than client-side router.push() on slow networks
        // Redirect is already handled in logout() server action
        window.location.href = result.redirectTo
      } else {
        alert('Failed to logout. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('An error occurred while logging out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            {vendor && (
              <p className="text-sm text-gray-500">{vendor.store_name}</p>
            )}
          </div>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-green-400 to-green-600">
              <span className="text-sm font-semibold text-white">
                {vendor?.store_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                {vendor && (
                  <>
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{vendor.store_name}</p>
                      <p className="text-xs text-gray-500">/{vendor.slug}</p>
                    </div>
                  </>
                )}
                <a
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </a>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full border-t px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
