import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalApi } from '@/features/approvals/api/approvalApi'
import { invalidateDecisionQueries } from '@/features/approvals/hooks/invalidateDecisionQueries'
import { showSuccess } from '@/lib/toast'

export function useRejectRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) => approvalApi.reject(id, reason),
    retry: false,
    onSuccess: () => {
      showSuccess('Request rejected')
    },
    onSettled: () => invalidateDecisionQueries(queryClient),
  })
}
