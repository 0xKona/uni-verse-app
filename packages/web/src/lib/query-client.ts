import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized QueryClient configuration for TanStack Query
 * Handles caching, refetching, and error management
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before marking as stale
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes before garbage collection
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once with exponential backoff
      retry: 1,
      // Don't refetch on window focus (too aggressive for this app)
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
