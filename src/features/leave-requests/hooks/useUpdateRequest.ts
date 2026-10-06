import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveRequestApi } from '@/features/leave-requests/api/leaveRequestApi'
import type { UpdatePayload } from '@/features/leave-requests/types/leaveRequestTypes'
import { showSuccess } from '@/lib/toast'

export function useUpdateRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePayload) => leaveRequestApi.update(id, payload),
    retry: false,
    onSuccess: () => {
      showSuccess('Request updated')
    },
    // Detail, history and lists all change; the balances too (pending days follow the dates).
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVE_REQUESTS.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BALANCES.ALL }),
      ]),
  })
}
