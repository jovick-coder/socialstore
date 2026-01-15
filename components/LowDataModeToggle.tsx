'use client'

/**
 * Low Data Mode Toggle Component
 * 
 * Shows current state and allows users to enable/disable Low Data Mode
 * Automatically detects system Data Saver mode and respects user preference
 * 
 * Features:
 * - Shows system Data Saver status
 * - Toggle to override system setting
 * - Shows current network type (if available)
 * - Shows data saved estimation
 */

import { useLowDataMode } from '@/lib/LowDataModeContext'
import { getNetworkInfo, isVerySlowConnection } from '@/lib/lowDataMode'
import { useEffect, useState } from 'react'

export default function LowDataModeToggle() {
  const { isActive, toggle, systemSaveDataEnabled, manualOverride, reset } = useLowDataMode()
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getNetworkInfo> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const info = getNetworkInfo()
    setNetworkInfo(info)
  }, [])

  if (!mounted) return null

  const isVerySlowNet = isVerySlowConnection()

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm border border-gray-200">
      {/* Status Icon */}
      <div className="relative">
        <svg
          className={`h-5 w-5 transition-colors ${isActive ? 'text-amber-500' : 'text-gray-400'
            }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {isActive && (
          <div className="absolute inset-0 animate-pulse bg-amber-500 rounded-full opacity-20" />
        )}
      </div>

      {/* Status Text */}
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">
          {isActive ? 'Low Data Mode' : 'Normal Mode'}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          {systemSaveDataEnabled && !manualOverride && (
            <>
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3a1 1 0 100 2h8a1 1 0 100-2H4a2 2 0 012-2zm5 6a1 1 0 10-2 0v3H5a1 1 0 100 2h8a1 1 0 100-2h-4V11z" clipRule="evenodd" />
              </svg>
              <span>System Data Saver</span>
            </>
          )}
          {networkInfo?.effectiveType && (
            <>
              <span>•</span>
              <span className={isVerySlowNet ? 'text-red-600 font-semibold' : ''}>
                {networkInfo.effectiveType.toUpperCase()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggle}
        className={`ml-auto px-2 py-1 rounded text-xs font-semibold transition-colors ${isActive
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        {isActive ? 'Disable' : 'Enable'}
      </button>

      {/* Reset Button (only show if manually overridden) */}
      {manualOverride !== null && (
        <button
          onClick={reset}
          title="Reset to system setting"
          className="px-1 py-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Info Tooltip */}
      <div className="group relative ml-1">
        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 w-48 z-50">
          <p>Low Data Mode reduces:</p>
          <ul className="mt-1 list-disc list-inside space-y-0.5">
            <li>Image loading (1 per product)</li>
            <li>Animations (disabled)</li>
            <li>Network requests</li>
            <li>Data usage ~70%</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
