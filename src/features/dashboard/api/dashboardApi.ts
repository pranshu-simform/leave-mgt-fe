import { API_ROUTES } from '@/constants/apiRoutes'
import { apiClient } from '@/lib/apiClient'

export const dashboardApi = {
  getHealth: () => apiClient.get<{ status: string }>(API_ROUTES.HEALTH.READY),
}
