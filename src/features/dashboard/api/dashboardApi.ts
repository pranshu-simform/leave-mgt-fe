import { API_ROUTES } from '@/constants/apiRoutes'
import type { DashboardStats } from '@/features/dashboard/types/dashboardTypes'
import { apiClient, type ApiResponse } from '@/lib/apiClient'

export const dashboardApi = {
  stats: async (year?: number) => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(API_ROUTES.DASHBOARD.STATS, {
      params: year ? { year } : undefined,
    })
    return response.data
  },
}
