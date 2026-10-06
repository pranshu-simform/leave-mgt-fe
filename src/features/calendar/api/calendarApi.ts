import { API_ROUTES } from '@/constants/apiRoutes'
import type { Holiday, SummaryDay, Team } from '@/features/calendar/types/calendarTypes'
import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'
import {
  apiClient,
  type ApiResponse,
  type PaginatedApiResponse,
  type PaginatedResult,
} from '@/lib/apiClient'

export interface CalendarMonthParams {
  month: string
  // HR chooses a team; for everyone else the API uses their own and this is left out.
  managerId?: string
  status?: 'APPROVED'
  page: number
  limit: number
}

export const calendarApi = {
  month: async (params: CalendarMonthParams): Promise<PaginatedResult<AbsenceItem>> => {
    const response = await apiClient.get<PaginatedApiResponse<AbsenceItem>>(
      API_ROUTES.CALENDAR.MONTH,
      { params },
    )
    return { items: response.data, pagination: response.pagination }
  },

  summary: async (params: { month: string; managerId?: string }) => {
    const response = await apiClient.get<PaginatedApiResponse<SummaryDay>>(
      API_ROUTES.CALENDAR.SUMMARY,
      { params: { ...params, page: 1, limit: 100 } },
    )
    return response.data
  },

  teams: async () => {
    const response = await apiClient.get<ApiResponse<Team[]>>(API_ROUTES.CALENDAR.TEAMS)
    return response.data
  },

  holidays: async (month: string) => {
    const response = await apiClient.get<ApiResponse<Holiday[]>>(API_ROUTES.HOLIDAYS.LIST, {
      params: { month },
    })
    return response.data
  },
}
