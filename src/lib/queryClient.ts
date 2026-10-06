import { QueryClient } from '@tanstack/react-query'

import { REACT_QUERY_CONFIG } from '@/constants/constant'
import { isApiError } from '@/lib/apiClient'

function isClientError(error: unknown): boolean {
  return isApiError(error) && error.status >= 400 && error.status < 500
}

const retryDelay = (attemptIndex: number): number =>
  Math.min(REACT_QUERY_CONFIG.RETRY_DELAY * 2 ** attemptIndex, REACT_QUERY_CONFIG.MAX_RETRY_DELAY)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: REACT_QUERY_CONFIG.STALE_TIME_OPTIONS.SHORT,

      gcTime: REACT_QUERY_CONFIG.CACHE_TIME,

      retry: (failureCount, error) => {
        if (isClientError(error)) return false

        return failureCount < REACT_QUERY_CONFIG.GLOBAL_RETRY
      },

      retryDelay,

      refetchOnWindowFocus: true,

      refetchOnReconnect: true,

      refetchOnMount: 'always',
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isClientError(error)) return false

        return failureCount < 1
      },

      retryDelay,
    },
  },
})
