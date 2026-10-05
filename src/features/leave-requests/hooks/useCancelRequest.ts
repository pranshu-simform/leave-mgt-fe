import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveRequestApi } from '@/features/leave-requests/api/leaveRequestApi'
import { handleApiError } from '@/lib/apiClient'
import { showError, showSuccess } from '@/lib/toast'

export function useCancelRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => leaveRequestApi.cancel(id),
    onSuccess: () => {
      showSuccess('Request cancelled')
    },
    onError: (error) => {
      showError(handleApiError(error, 'Could not cancel the request'))
    },
    // Success or not, what is on screen may be stale: the request may have been decided meanwhile.
    // Balances are included because cancelling an approved request refunds its days.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVE_REQUESTS.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BALANCES.ALL }),
      ]),
  })
}
