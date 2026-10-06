import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalApi } from '@/features/approvals/api/approvalApi'
import { invalidateDecisionQueries } from '@/features/approvals/hooks/invalidateDecisionQueries'
import { showSuccess } from '@/lib/toast'

// Errors (already decided, not enough balance, gone) are handled by the review sheet, which shows
// the server's message and decides whether to stay open.
export function useApproveRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => approvalApi.approve(id),
    // Never retried: a retry after a lost response would report "already approved" for our own success.
    retry: false,
    onSuccess: () => {
      showSuccess('Request approved')
    },
    onSettled: () => invalidateDecisionQueries(queryClient),
  })
}
