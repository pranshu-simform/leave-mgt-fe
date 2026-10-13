import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { adminApi } from '@/features/admin/api/adminApi'

export function useAdminLeaveTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.LEAVE_TYPES,
    queryFn: adminApi.listLeaveTypes,
  })
}
