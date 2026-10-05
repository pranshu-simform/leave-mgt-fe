import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { balanceApi } from '@/features/balances/api/balanceApi'

// Without a year the server uses the current year, so the dashboard and the server agree.
export function useMyBalances(year?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.BALANCES.ME(year),
    queryFn: () => balanceApi.mine(year),
  })
}
