import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminUserParams } from '@/features/admin/types/adminTypes'

// `enabled: false` keeps a list that only a dialog needs from loading until the dialog opens.
export function useAdminUsers(params: AdminUserParams, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.USERS.LIST(params),
    queryFn: () => adminApi.listUsers(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}
