import { useMutation } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { authApi } from '@/features/auth/api/authApi'
import { queryClient } from '@/lib/queryClient'

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (user) => {
      // A fresh sign-in starts from an empty cache: nothing from a previous user survives.
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== QUERY_KEYS.AUTH.ME[0],
      })
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, user)
    },
    // The mutation itself never retries a 401 (wrong password), see the client's retry policy.
  })
}
