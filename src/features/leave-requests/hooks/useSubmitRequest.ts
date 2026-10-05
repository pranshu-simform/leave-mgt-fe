import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveRequestApi } from '@/features/leave-requests/api/leaveRequestApi'
import { showSuccess } from '@/lib/toast'

// Errors are handled by the form, which maps them onto its fields; anything else it toasts.
export function useSubmitRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: leaveRequestApi.create,
    // Never retried: a retry after a lost response could create the request twice.
    retry: false,
    onSuccess: (request) => {
      // A type that needs no approval comes back already approved.
      showSuccess(request.status === 'APPROVED' ? 'Leave approved' : 'Request submitted')
    },
    // Pending days change on submit, and "used" changes when the request was approved at once.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVE_REQUESTS.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BALANCES.ALL }),
      ]),
  })
}
