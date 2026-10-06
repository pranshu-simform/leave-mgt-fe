import { QueryClient } from '@tanstack/react-query'

import { REACT_QUERY_CONFIG } from '@/constants/constant'
import { QUERY_KEYS } from '@/constants/queryKeys'
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

// Drops everything that belongs to the signed-in user and marks the session as signed out. Used on
// sign-in, sign-out and a failed refresh, so one user's data can never show up for the next.
export async function clearUserData(): Promise<void> {
  // The session goes first, so the screens (and their queries) are replaced by the sign-in page
  // before the data is removed. The other way round, a mounted screen refetches what was removed.
  queryClient.setQueryData(QUERY_KEYS.AUTH.ME, null)
  await queryClient.cancelQueries()
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== QUERY_KEYS.AUTH.ME[0] })
}
