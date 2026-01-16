/**
 * TanStack Query Configuration
 *
 * Performance strategy:
 * - Long staleTime (10 min) to avoid unnecessary refetches
 * - Long gcTime/cacheTime (30 min) to keep data in memory while navigating
 * - Disable refetchOnWindowFocus to prevent interruptions
 * - Disable refetchOnMount when stale data exists
 *
 * This ensures dashboard pages feel instant when switching between them,
 * similar to a client-side SPA.
 */

import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 10 minutes - no refetch when navigating between dashboard pages
        staleTime: 1000 * 60 * 10,

        // Keep data in memory for 30 minutes even if not in use
        // When user navigates back to a page, cached data shows instantly
        gcTime: 1000 * 60 * 30,

        // Don't refetch when window regains focus (user clicks browser)
        // Prevents annoying loading states while user is doing something else
        refetchOnWindowFocus: false,

        // Don't refetch when component mounts if data is fresh or stale (not dehydrated)
        // This is critical for dashboard SPA-like feel
        refetchOnMount: false,

        // Refetch on reconnect only if data is stale
        refetchOnReconnect: (query) =>
          query.state.dataUpdatedAt < Date.now() - 1000 * 60 * 10,

        // Retry failed requests once
        retry: 1,

        // Don't retry on 4xx errors (auth issues, not found, etc)
        retryOnMount: false,
      },
    },
  });
