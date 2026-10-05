import { API_ROUTES } from '@/constants/apiRoutes'
import type { Balance } from '@/features/balances/types/balanceTypes'
import { apiClient, type ApiResponse } from '@/lib/apiClient'

export const balanceApi = {
  mine: async (year?: number) => {
    const response = await apiClient.get<ApiResponse<Balance[]>>(API_ROUTES.BALANCES.ME, {
      params: year ? { year } : undefined,
    })
    return response.data
  },
}
