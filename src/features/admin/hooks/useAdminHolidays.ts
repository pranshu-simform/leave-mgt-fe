import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminHolidayParams } from '@/features/admin/types/adminTypes'

export function useAdminHolidays(params: AdminHolidayParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.HOLIDAYS.LIST(params),
    queryFn: () => adminApi.listHolidays(params),
    placeholderData: keepPreviousData,
  })
}
