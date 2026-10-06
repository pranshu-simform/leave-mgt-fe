import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { calendarApi } from '@/features/calendar/api/calendarApi'

const PAGE_SIZE = 100
// A team in one month is far below this. The cap keeps the load bounded if it ever were not.
const MAX_PAGES = 10

interface CalendarMonthOptions {
  month: string
  managerId?: string
  includePending: boolean
  enabled: boolean
}

// Everyone away in one team and one month. The API pages by leave, and the grid needs all of them,
// so the pages are fetched one after another until the month is complete (or the cap is reached).
export function useCalendarMonth({
  month,
  managerId,
  includePending,
  enabled,
}: CalendarMonthOptions) {
  const status = includePending ? undefined : ('APPROVED' as const)
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.CALENDAR.MONTH({ month, managerId, status }),
    queryFn: ({ pageParam }) =>
      calendarApi.month({ month, managerId, status, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) =>
      pagination.hasNextPage && pagination.page < MAX_PAGES ? pagination.page + 1 : undefined,
    enabled,
  })

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data])
  const lastPage = query.data?.pages.at(-1)
  return {
    items,
    isLoading: query.isLoading,
    isLoadingMore: Boolean(hasNextPage),
    // More leave exists than the cap allows; the grid says so instead of pretending to be complete.
    isTruncated: Boolean(lastPage?.pagination.hasNextPage && !hasNextPage),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
