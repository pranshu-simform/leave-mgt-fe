import { API_ROUTES } from '@/constants/apiRoutes'
import type { LeaveType } from '@/features/leave-types/types/leaveTypeTypes'
import { apiClient, type ApiResponse } from '@/lib/apiClient'

export const leaveTypeApi = {
  list: async () => {
    const response = await apiClient.get<ApiResponse<LeaveType[]>>(API_ROUTES.LEAVE_TYPES.LIST)
    return response.data
  },
}
