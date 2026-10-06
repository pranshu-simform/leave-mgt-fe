import { API_ROUTES } from '@/constants/apiRoutes'
import type { LeaveStatus } from '@/constants/leaveStatus'
import type {
  LeaveRequest,
  OverlapSummary,
} from '@/features/leave-requests/types/leaveRequestTypes'
import {
  apiClient,
  type ApiResponse,
  type PaginatedApiResponse,
  type PaginatedResult,
} from '@/lib/apiClient'

export interface ApprovalListParams {
  page: number
  limit: number
  status: LeaveStatus
}

export const approvalApi = {
  list: async (params: ApprovalListParams): Promise<PaginatedResult<LeaveRequest>> => {
    const response = await apiClient.get<PaginatedApiResponse<LeaveRequest>>(
      API_ROUTES.APPROVALS.LIST,
      { params },
    )
    return { items: response.data, pagination: response.pagination }
  },

  overlaps: async (id: string) => {
    const response = await apiClient.get<ApiResponse<OverlapSummary>>(
      API_ROUTES.APPROVALS.OVERLAPS.replace(':id', id),
    )
    return response.data
  },

  approve: async (id: string) => {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>(
      API_ROUTES.APPROVALS.APPROVE.replace(':id', id),
    )
    return response.data
  },

  reject: async (id: string, reason: string) => {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>(
      API_ROUTES.APPROVALS.REJECT.replace(':id', id),
      { reason },
    )
    return response.data
  },
}
