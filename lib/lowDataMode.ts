/**
 * Low Data Mode Utilities
 * Optimizes app for slow or expensive networks
 *
 * Features:
 * - Detects navigator.connection.saveData (user's data saver preference)
 * - Reduces image loading (skip images below fold, load one image only)
 * - Disables animations (CSS animations, transitions)
 * - Loads text content first (prioritize content over media)
 * - Shows compressed image variants
 * - Manual toggle with localStorage persistence
 * - Graceful degradation on unsupported browsers
 */

/**
 * Check if browser has Data Saver mode enabled
 * Supported on: Chrome, Edge, Firefox (partial)
 *
 * @returns true if Data Saver is enabled, false otherwise
 */
export function getSystemSaveData(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection;
    return connection?.saveData ?? false;
  } catch {
    return false;
  }
}

/**
 * Get effective Low Data Mode state
 * Priority: Manual override > System setting
 *
 * @param manualOverride - User's manual preference from localStorage
 * @returns true if Low Data Mode should be active
 */
export function isLowDataModeActive(manualOverride: boolean | null): boolean {
  if (manualOverride !== null) {
    return manualOverride;
  }
  return getSystemSaveData();
}

/**
 * Determine image quality for Low Data Mode
 * Quality levels:
 * - full: All images, full resolution, all animations
 * - low: 1 image per product, 50% quality, no animations
 * - minimal: No images (text + icons only), no animations
 */
export type ImageQuality = "full" | "low" | "minimal";

/**
 * Get image quality level based on Low Data Mode state
 *
 * @param lowDataMode - Is Low Data Mode active
 * @param extremely - Force minimal mode (very slow networks)
 * @returns Image quality level
 */
export function getImageQuality(
  lowDataMode: boolean,
  extremely: boolean = false
): ImageQuality {
  if (extremely) return "minimal";
  if (lowDataMode) return "low";
  return "full";
}

/**
 * Get animation settings for Low Data Mode
 * Disables CSS animations and transitions to reduce CPU usage
 */
export function shouldDisableAnimations(lowDataMode: boolean): boolean {
  return lowDataMode;
}

/**
 * Get image loading strategy for Low Data Mode
 */
export interface ImageLoadingStrategy {
  // How many images to load per product (1 = first image only)
  maxImagesPerProduct: number;
  // Load images below fold (viewport + margin)
  loadBelowFold: boolean;
  // Image quality multiplier (0.5 = 50% quality)
  qualityMultiplier: number;
  // Use next-gen formats (WebP, AVIF)
  useNextGenFormats: boolean;
}

/**
 * Get image loading strategy based on data mode
 *
 * @param lowDataMode - Is Low Data Mode active
 * @param extremely - Force minimal mode
 * @returns Image loading strategy
 */
export function getImageLoadingStrategy(
  lowDataMode: boolean,
  extremely: boolean = false
): ImageLoadingStrategy {
  if (extremely) {
    return {
      maxImagesPerProduct: 0,
      loadBelowFold: false,
      qualityMultiplier: 0,
      useNextGenFormats: false,
    };
  }

  if (lowDataMode) {
    return {
      maxImagesPerProduct: 1,
      loadBelowFold: false,
      qualityMultiplier: 0.5,
      useNextGenFormats: true,
    };
  }

  return {
    maxImagesPerProduct: 5,
    loadBelowFold: true,
    qualityMultiplier: 1,
    useNextGenFormats: true,
  };
}

/**
 * Get CSS for disabling animations
 * Add this to global styles when Low Data Mode is active
 */
export function getAnimationDisableCss(): string {
  return `
    /* Disable animations in Low Data Mode to reduce CPU usage */
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  `;
}

/**
 * Storage keys for Low Data Mode preferences
 */
export const LOW_DATA_MODE_STORAGE_KEY = "lowDataMode";

/**
 * Get saved Low Data Mode preference from localStorage
 * Returns null if not set (user hasn't toggled)
 *
 * @returns true (enabled), false (disabled), or null (not set)
 */
export function getSavedLowDataModePreference(): boolean | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(LOW_DATA_MODE_STORAGE_KEY);
    if (saved === null) return null;
    return saved === "true";
  } catch {
    return null;
  }
}

/**
 * Save Low Data Mode preference to localStorage
 *
 * @param enabled - Whether to enable Low Data Mode
 */
export function saveLowDataModePreference(enabled: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LOW_DATA_MODE_STORAGE_KEY, String(enabled));
  } catch {
    // Graceful degradation: localStorage might be unavailable
    console.warn("Could not save Low Data Mode preference");
  }
}

/**
 * Clear Low Data Mode preference (revert to system setting)
 */
export function clearLowDataModePreference(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(LOW_DATA_MODE_STORAGE_KEY);
  } catch {
    console.warn("Could not clear Low Data Mode preference");
  }
}

/**
 * Get network connection type and effective type
 * Useful for additional optimization decisions
 */
export interface NetworkInfo {
  type: string | null; // '4g', '3g', '2g', 'wifi', etc.
  effectiveType: string | null; // '4g', '3g', '2g', 'slow-2g'
  downlink: number | null; // Mbps
  rtt: number | null; // milliseconds
  saveData: boolean;
}

/**
 * Get current network information
 *
 * @returns Network info (gracefully degraded on unsupported browsers)
 */
export function getNetworkInfo(): NetworkInfo {
  if (typeof window === "undefined") {
    return {
      type: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
      saveData: false,
    };
  }

  try {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    return {
      type: connection?.type ?? null,
      effectiveType: connection?.effectiveType ?? null,
      downlink: connection?.downlink ?? null,
      rtt: connection?.rtt ?? null,
      saveData: connection?.saveData ?? false,
    };
  } catch {
    return {
      type: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
      saveData: false,
    };
  }
}

/**
 * Check if connection is very slow (2G or slow-2G)
 *
 * @returns true if connection is very slow
 */
export function isVerySlowConnection(): boolean {
  const networkInfo = getNetworkInfo();
  return (
    networkInfo.effectiveType === "2g" ||
    networkInfo.effectiveType === "slow-2g"
  );
}

/**
 * Determine if images should be skipped entirely
 * Useful for extremely slow networks
 *
 * @param lowDataMode - Is Low Data Mode active
 * @returns true if images should be skipped
 */
export function shouldSkipImages(lowDataMode: boolean): boolean {
  if (!lowDataMode) return false;

  // If user is on very slow connection AND Low Data Mode is active
  return isVerySlowConnection();
}
