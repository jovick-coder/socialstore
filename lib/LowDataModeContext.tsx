'use client'

/**
 * Low Data Mode Context
 * Provides Low Data Mode state and control across the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  getSavedLowDataModePreference,
  saveLowDataModePreference,
  getSystemSaveData,
  isLowDataModeActive,
  getAnimationDisableCss,
} from '@/lib/lowDataMode'

/**
 * Low Data Mode Context Type
 */
interface LowDataModeContextType {
  // Is Low Data Mode currently active
  isActive: boolean
  // Manual override setting (null = use system setting)
  manualOverride: boolean | null
  // Toggle Low Data Mode (saves preference)
  toggle: () => void
  // Enable Low Data Mode
  enable: () => void
  // Disable Low Data Mode
  disable: () => void
  // Reset to system setting
  reset: () => void
  // Is system Data Saver mode enabled
  systemSaveDataEnabled: boolean
  // Is Low Data Mode loading (checking system settings)
  isLoading: boolean
}

/**
 * Create Low Data Mode context
 */
const LowDataModeContext = createContext<LowDataModeContextType | undefined>(undefined)

/**
 * Low Data Mode Provider
 * Wrap your app with this provider to enable Low Data Mode
 * 
 * @example
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <LowDataModeProvider>
 *           {children}
 *         </LowDataModeProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */
export function LowDataModeProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [manualOverride, setManualOverride] = useState<boolean | null>(null)
  const [systemSaveDataEnabled, setSystemSaveDataEnabled] = useState(false)

  // Initialize on mount (client-side only)
  useEffect(() => {
    // Get saved preference
    const saved = getSavedLowDataModePreference()
    setManualOverride(saved)

    // Check system setting
    const systemSaveData = getSystemSaveData()
    setSystemSaveDataEnabled(systemSaveData)

    // Inject animation-disable CSS if needed
    if (isLowDataModeActive(saved)) {
      injectAnimationDisableCss()
    }

    setIsLoading(false)
  }, [])

  // Re-inject animation CSS when state changes
  useEffect(() => {
    if (isLoading) return

    if (isLowDataModeActive(manualOverride)) {
      injectAnimationDisableCss()
    } else {
      removeAnimationDisableCss()
    }
  }, [manualOverride, isLoading])

  const isActive = isLowDataModeActive(manualOverride)

  const toggle = () => {
    setManualOverride(!isActive)
    saveLowDataModePreference(!isActive)
  }

  const enable = () => {
    setManualOverride(true)
    saveLowDataModePreference(true)
  }

  const disable = () => {
    setManualOverride(false)
    saveLowDataModePreference(false)
  }

  const reset = () => {
    setManualOverride(null)
  }

  const value: LowDataModeContextType = {
    isActive,
    manualOverride,
    toggle,
    enable,
    disable,
    reset,
    systemSaveDataEnabled,
    isLoading,
  }

  return (
    <LowDataModeContext.Provider value={value}>
      {children}
    </LowDataModeContext.Provider>
  )
}

/**
 * Hook to use Low Data Mode context
 * 
 * @throws Error if used outside LowDataModeProvider
 * @example
 * export default function MyComponent() {
 *   const { isActive, toggle } = useLowDataMode()
 *   return (
 *     <button onClick={toggle}>
 *       Low Data Mode: {isActive ? 'ON' : 'OFF'}
 *     </button>
 *   )
 * }
 */
export function useLowDataMode(): LowDataModeContextType {
  const context = useContext(LowDataModeContext)
  if (context === undefined) {
    throw new Error('useLowDataMode must be used within LowDataModeProvider')
  }
  return context
}

/**
 * Inject animation-disable CSS into document
 * This drastically reduces CPU usage in Low Data Mode
 */
function injectAnimationDisableCss(): void {
  if (typeof document === 'undefined') return

  // Check if already injected
  if (document.getElementById('low-data-mode-styles')) {
    return
  }

  const style = document.createElement('style')
  style.id = 'low-data-mode-styles'
  style.textContent = `
    /* Low Data Mode: Disable animations to reduce CPU/battery usage */
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    /* Disable smooth scrolling */
    html {
      scroll-behavior: auto !important;
    }

    /* Disable hover animations */
    a:hover,
    button:hover,
    [role="button"]:hover {
      animation: none !important;
      transition: none !important;
    }

    /* Disable CSS transitions on all interactive elements */
    input,
    textarea,
    select {
      transition: none !important;
    }

    /* Disable transforms and other expensive properties */
    @keyframes none {}
  `
  document.head.appendChild(style)
}

/**
 * Remove animation-disable CSS from document
 */
function removeAnimationDisableCss(): void {
  if (typeof document === 'undefined') return

  const style = document.getElementById('low-data-mode-styles')
  if (style) {
    style.remove()
  }
}
