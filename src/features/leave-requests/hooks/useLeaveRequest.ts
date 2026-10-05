import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveRequestApi } from '@/features/leave-requests/api/leaveRequestApi'

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVE_REQUESTS.DETAIL(id),
    queryFn: () => leaveRequestApi.getById(id),
    enabled: !!id,
  })
}
