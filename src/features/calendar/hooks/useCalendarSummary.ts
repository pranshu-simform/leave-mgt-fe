import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { calendarApi } from '@/features/calendar/api/calendarApi'

// People away per weekday, for managers and HR (the API refuses it for employees).
export function useCalendarSummary(month: string, managerId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.CALENDAR.SUMMARY({ month, managerId }),
    queryFn: () => calendarApi.summary({ month, managerId }),
    enabled,
  })
}
