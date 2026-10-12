import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminRequestParams } from '@/features/admin/types/adminTypes'

export function useAdminRequests(params: AdminRequestParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.REQUESTS.LIST(params),
    queryFn: () => adminApi.listRequests(params),
    placeholderData: keepPreviousData,
  })
}
