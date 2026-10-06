import { useQuery } from '@tanstack/react-query'
import { REACT_QUERY_CONFIG } from '@/constants/constant'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { calendarApi } from '@/features/calendar/api/calendarApi'

export function useHolidays(month: string) {
  return useQuery({
    queryKey: QUERY_KEYS.HOLIDAYS.MONTH(month),
    queryFn: () => calendarApi.holidays(month),
    staleTime: REACT_QUERY_CONFIG.STALE_TIME_OPTIONS.LONG,
  })
}
