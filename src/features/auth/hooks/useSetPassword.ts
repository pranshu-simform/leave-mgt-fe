import { useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { authApi } from '@/features/auth/api/authApi'

// Asks the server whether the link is still good, and for whom. Nothing is consumed by asking, so
// it never refetches by itself (each call counts against the rate limit).
export function useSetPasswordLink(token: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.SET_PASSWORD_LINK(token ?? ''),
    queryFn: () => authApi.checkSetPasswordLink(token ?? ''),
    enabled: token !== null,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}

export function useSetPassword() {
  return useMutation({
    mutationFn: authApi.setPassword,
    retry: false,
  })
}
