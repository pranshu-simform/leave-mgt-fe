import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { balanceApi } from '@/features/balances/api/balanceApi'

// An employee's balances, for a manager of theirs or HR (the API answers 404 otherwise).
export function useUserBalances(userId: string, year: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.BALANCES.USER(userId, year),
    queryFn: () => balanceApi.forUser(userId, year),
    enabled: enabled && !!userId,
  })
}
