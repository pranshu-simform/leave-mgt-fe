import { API_ROUTES } from '@/constants/apiRoutes'
import { apiClient, type ApiResponse } from '@/lib/apiClient'

export const dashboardApi = {
  getHealth: async () => {
    const response = await apiClient.get<ApiResponse<{ status: string }>>(API_ROUTES.HEALTH.READY)
    return response.data
  },
}
