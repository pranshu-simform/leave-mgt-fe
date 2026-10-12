import { API_ROUTES } from '@/constants/apiRoutes'
import type { Balance } from '@/features/balances/types/balanceTypes'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import type {
  AdjustBalancePayload,
  AdminHoliday,
  AdminHolidayParams,
  AdminLeaveType,
  AdminRequestParams,
  AdminUser,
  AdminUserParams,
  AllocationResult,
  CreateHolidayPayload,
  CreateLeaveTypePayload,
  ReconcileReport,
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

  listUsers: async (params: AdminUserParams): Promise<PaginatedResult<AdminUser>> => {
    const response = await apiClient.get<PaginatedApiResponse<AdminUser>>(
      API_ROUTES.ADMIN.USERS.LIST,
      { params },
    )
    return { items: response.data, pagination: response.pagination }
  },

  listRequests: async (params: AdminRequestParams): Promise<PaginatedResult<LeaveRequest>> => {
    const response = await apiClient.get<PaginatedApiResponse<LeaveRequest>>(
      API_ROUTES.ADMIN.REQUESTS.LIST,
      { params },
    )
    return { items: response.data, pagination: response.pagination }
  },

  allocateBalances: async (year: number) => {
    const response = await apiClient.post<ApiResponse<AllocationResult>>(
      API_ROUTES.ADMIN.BALANCES.ALLOCATE,
      { year },
    )
    return response.data
  },

  adjustBalance: async (payload: AdjustBalancePayload) => {
    const response = await apiClient.post<ApiResponse<Balance>>(
      API_ROUTES.ADMIN.BALANCES.ADJUST,
      payload,
    )
    return response.data
  },

  reconcile: async (year: number) => {
    const response = await apiClient.get<ApiResponse<ReconcileReport>>(
      API_ROUTES.ADMIN.BALANCES.RECONCILE,
      { params: { year } },
    )
    return response.data
  },
}
