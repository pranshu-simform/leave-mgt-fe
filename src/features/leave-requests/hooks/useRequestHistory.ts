import { useInfiniteQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { leaveRequestApi } from '@/features/leave-requests/api/leaveRequestApi'

const HISTORY_PAGE_SIZE = 25

// The timeline reads oldest first and grows with "Load more", so it is an infinite query.
export function useRequestHistory(id: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.LEAVE_REQUESTS.HISTORY(id),
    queryFn: ({ pageParam }) => leaveRequestApi.history(id, pageParam, HISTORY_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) =>
      pagination.hasNextPage ? pagination.page + 1 : undefined,
    enabled: !!id,
  })
}
