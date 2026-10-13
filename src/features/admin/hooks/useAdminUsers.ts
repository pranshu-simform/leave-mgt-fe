import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminUserParams } from '@/features/admin/types/adminTypes'

export function useAdminUsers(params: AdminUserParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.USERS(params),
    queryFn: () => adminApi.listUsers(params),
    placeholderData: keepPreviousData,
  })
}
