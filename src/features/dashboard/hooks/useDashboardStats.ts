import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { dashboardApi } from '@/features/dashboard/api/dashboardApi'

// Without a year the server uses the current year, the same as the balance cards.
export function useDashboardStats(year?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS(year),
    queryFn: () => dashboardApi.stats(year),
  })
}
