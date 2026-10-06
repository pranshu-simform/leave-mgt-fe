import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, type ReactNode } from 'react'
import { AUTH_EVENTS } from '@/constants/constant'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { AuthContext, type AuthContextValue } from '@/context/authContext'
import { authApi } from '@/features/auth/api/authApi'
import type { AuthUser } from '@/features/auth/types/authTypes'
import { isApiError } from '@/lib/apiClient'
import { clearUserData, queryClient } from '@/lib/queryClient'
import { showInfo } from '@/lib/toast'

// "Not signed in" is an answer, not an error: a 401 here means there is no session.
async function restoreSession(): Promise<AuthUser | null> {
  try {
    return await authApi.me()
  } catch (error) {
    if (isApiError(error) && error.status === 401) return null
    throw error
  }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: restoreSession,
    staleTime: Infinity,
    retry: false,
  })

  useEffect(() => {
    const onForceLogout = () => {
      const wasSignedIn = Boolean(queryClient.getQueryData(QUERY_KEYS.AUTH.ME))
      void clearUserData()
      if (wasSignedIn) showInfo('Your session expired. Sign in again.', 'session-expired')
    }
    window.addEventListener(AUTH_EVENTS.FORCE_LOGOUT, onForceLogout)
    return () => window.removeEventListener(AUTH_EVENTS.FORCE_LOGOUT, onForceLogout)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user: data ?? null, isAuthenticated: Boolean(data), isLoading: isPending }),
    [data, isPending],
  )
  return <AuthContext value={value}>{children}</AuthContext>
}
