import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { dashboardApi } from '@/features/dashboard/api/dashboardApi'

export function useApiHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.HEALTH.READY,
    queryFn: dashboardApi.getHealth,
    retry: false,
  })
}
