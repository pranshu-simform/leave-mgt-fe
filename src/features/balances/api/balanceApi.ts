import { API_ROUTES } from '@/constants/apiRoutes'
import type { Balance } from '@/features/balances/types/balanceTypes'
import { apiClient, type ApiResponse } from '@/lib/apiClient'

export const balanceApi = {
  forUser: async (userId: string, year: number) => {
    const response = await apiClient.get<ApiResponse<Balance[]>>(
      API_ROUTES.BALANCES.USER.replace(':id', userId),
      { params: { year } },
    )
    return response.data
  },

  mine: async (year?: number) => {
    const response = await apiClient.get<ApiResponse<Balance[]>>(API_ROUTES.BALANCES.ME, {
      params: year ? { year } : undefined,
    })
    return response.data
  },
}
