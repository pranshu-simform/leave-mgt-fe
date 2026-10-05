import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { REACT_QUERY_CONFIG } from '@/constants/constant'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveRequestApi } from '@/features/leave-requests/api/leaveRequestApi'
import type { RequestPayload } from '@/features/leave-requests/types/leaveRequestTypes'
import { isValidIsoDate } from '@/lib/dates'

// What the request would do, without creating it. It is a read (a POST only because it carries a
// body), so it is a query: the key holds the values, which means a slow answer for older input can
// never be shown for newer input.
export function usePreviewRequest(values: RequestPayload) {
  const { leaveTypeId, startDate, endDate } = values
  const complete =
    leaveTypeId !== '' &&
    isValidIsoDate(startDate) &&
    isValidIsoDate(endDate) &&
    startDate <= endDate

  return useQuery({
    queryKey: QUERY_KEYS.LEAVE_REQUESTS.PREVIEW(values),
    queryFn: () => leaveRequestApi.preview(values),
    enabled: complete,
    // Keeps the last result on screen, dimmed, while the next one loads.
    placeholderData: keepPreviousData,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME_OPTIONS.VERY_SHORT,
  })
}
