import { API_ROUTES } from '@/constants/apiRoutes'
import type {
  LeaveRequest,
  LeaveRequestListParams,
  RequestEvent,
} from '@/features/leave-requests/types/leaveRequestTypes'
import {
  apiClient,
  type ApiResponse,
  type PaginatedApiResponse,
  type PaginatedResult,
} from '@/lib/apiClient'

export const leaveRequestApi = {
  listMine: async (params: LeaveRequestListParams): Promise<PaginatedResult<LeaveRequest>> => {
    const response = await apiClient.get<PaginatedApiResponse<LeaveRequest>>(
      API_ROUTES.LEAVE_REQUESTS.LIST,
      { params },
    )
    return { items: response.data, pagination: response.pagination }
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<LeaveRequest>>(
      API_ROUTES.LEAVE_REQUESTS.GET.replace(':id', id),
    )
    return response.data
  },

  history: async (
    id: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<RequestEvent>> => {
    const response = await apiClient.get<PaginatedApiResponse<RequestEvent>>(
      API_ROUTES.LEAVE_REQUESTS.HISTORY.replace(':id', id),
      { params: { page, limit } },
    )
    return { items: response.data, pagination: response.pagination }
  },

  cancel: async (id: string) => {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>(
      API_ROUTES.LEAVE_REQUESTS.CANCEL.replace(':id', id),
    )
    return response.data
  },
}
