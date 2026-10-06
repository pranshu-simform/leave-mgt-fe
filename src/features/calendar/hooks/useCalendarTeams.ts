import { useQuery } from '@tanstack/react-query'
import { REACT_QUERY_CONFIG } from '@/constants/constant'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { calendarApi } from '@/features/calendar/api/calendarApi'

// The teams HR can look at. A small reference list that rarely changes.
export function useCalendarTeams(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.CALENDAR.TEAMS,
    queryFn: calendarApi.teams,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME_OPTIONS.LONG,
    enabled,
  })
}
