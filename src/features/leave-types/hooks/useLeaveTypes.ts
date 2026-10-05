import { useQuery } from '@tanstack/react-query'
import { REACT_QUERY_CONFIG } from '@/constants/constant'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveTypeApi } from '@/features/leave-types/api/leaveTypeApi'

// A small reference list that rarely changes.
export function useLeaveTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVE_TYPES.ALL,
    queryFn: leaveTypeApi.list,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME_OPTIONS.LONG,
  })
}
