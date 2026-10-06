import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveRequestApi } from '@/features/leave-requests/api/leaveRequestApi'
import type { LeaveRequestListParams } from '@/features/leave-requests/types/leaveRequestTypes'

export function useMyRequests(params: LeaveRequestListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVE_REQUESTS.LIST(params),
    queryFn: () => leaveRequestApi.listMine(params),
    // Keeps the current rows on screen while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}
