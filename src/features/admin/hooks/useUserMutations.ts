import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/adminApi'
import { invalidateUserQueries } from '@/features/admin/hooks/invalidateAdminQueries'
import type { CreateUserPayload } from '@/features/admin/types/adminTypes'
import { showSuccess } from '@/lib/toast'

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => adminApi.createUser(payload),
    retry: false,
    onSuccess: (created) => {
      showSuccess(`${created.name} added. A link to set a password was emailed`)
    },
    onSettled: () => invalidateUserQueries(queryClient),
  })
}

export function useResendInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.resendInvite(id),
    retry: false,
    onSuccess: () => {
      showSuccess('A new link was emailed')
    },
    // A 409 means the person set a password meanwhile, so the list is refreshed either way.
    onSettled: () => invalidateUserQueries(queryClient),
  })
}
