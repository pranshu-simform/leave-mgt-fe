import { API_ROUTES } from '@/constants/apiRoutes'
import type {
  AdminHoliday,
  AdminHolidayParams,
  AdminLeaveType,
  CreateHolidayPayload,
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
} from '@/features/admin/types/adminTypes'
import {
  apiClient,
  type ApiResponse,
  type PaginatedApiResponse,
  type PaginatedResult,
} from '@/lib/apiClient'

export const adminApi = {
  listLeaveTypes: async () => {
    const response = await apiClient.get<ApiResponse<AdminLeaveType[]>>(
      API_ROUTES.ADMIN.LEAVE_TYPES.LIST,
    )
    return response.data
  },

  createLeaveType: async (payload: CreateLeaveTypePayload) => {
    const response = await apiClient.post<ApiResponse<AdminLeaveType>>(
      API_ROUTES.ADMIN.LEAVE_TYPES.CREATE,
      payload,
    )
    return response.data
  },

  updateLeaveType: async (id: string, payload: UpdateLeaveTypePayload) => {
    const response = await apiClient.patch<ApiResponse<AdminLeaveType>>(
      API_ROUTES.ADMIN.LEAVE_TYPES.UPDATE.replace(':id', id),
      payload,
    )
    return response.data
  },

  listHolidays: async (params: AdminHolidayParams): Promise<PaginatedResult<AdminHoliday>> => {
    const response = await apiClient.get<PaginatedApiResponse<AdminHoliday>>(
      API_ROUTES.ADMIN.HOLIDAYS.LIST,
      { params },
    )
    return { items: response.data, pagination: response.pagination }
  },

  createHoliday: async (payload: CreateHolidayPayload) => {
    const response = await apiClient.post<ApiResponse<AdminHoliday>>(
      API_ROUTES.ADMIN.HOLIDAYS.CREATE,
      payload,
    )
    return response.data
  },

  deleteHoliday: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      API_ROUTES.ADMIN.HOLIDAYS.DELETE.replace(':id', id),
    )
    return response.data
  },
}
