import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/adminApi'
import { invalidateLeaveTypeQueries } from '@/features/admin/hooks/invalidateAdminQueries'
import type {
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
} from '@/features/admin/types/adminTypes'
import { showSuccess } from '@/lib/toast'

export function useCreateLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLeaveTypePayload) => adminApi.createLeaveType(payload),
    retry: false,
    onSuccess: (created) => {
      showSuccess(`${created.name} created`)
    },
    onSettled: () => invalidateLeaveTypeQueries(queryClient),
  })
}

export function useUpdateLeaveType(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateLeaveTypePayload) => adminApi.updateLeaveType(id, payload),
    retry: false,
    onSuccess: (updated) => {
      showSuccess(`${updated.name} saved`)
    },
    onSettled: () => invalidateLeaveTypeQueries(queryClient),
  })
}
