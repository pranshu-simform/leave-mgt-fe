import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/adminApi'
import { invalidateHolidayQueries } from '@/features/admin/hooks/invalidateAdminQueries'
import type { CreateHolidayPayload } from '@/features/admin/types/adminTypes'
import { showSuccess } from '@/lib/toast'

export function useAddHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHolidayPayload) => adminApi.createHoliday(payload),
    retry: false,
    onSuccess: (created) => {
      showSuccess(`${created.name} added`)
    },
    onSettled: () => invalidateHolidayQueries(queryClient),
  })
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteHoliday(id),
    retry: false,
    onSuccess: () => {
      showSuccess('Holiday deleted')
    },
    onSettled: () => invalidateHolidayQueries(queryClient),
  })
}
