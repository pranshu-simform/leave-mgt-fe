import { API_ROUTES } from '@/constants/apiRoutes'
import type { AuthUser, SetPasswordLink } from '@/features/auth/types/authTypes'
import type { LoginFormData } from '@/features/auth/schemas/authSchema'
import { apiClient, type ApiResponse } from '@/lib/apiClient'

export const authApi = {
  login: async (credentials: LoginFormData) => {
    const response = await apiClient.post<ApiResponse<AuthUser>>(API_ROUTES.AUTH.LOGIN, credentials)
    return response.data
  },

  me: async () => {
    const response = await apiClient.get<ApiResponse<AuthUser>>(API_ROUTES.AUTH.ME)
    return response.data
  },

  // The set-password link: the token goes in the body, never in a URL.
  checkSetPasswordLink: async (token: string) => {
    const response = await apiClient.post<ApiResponse<SetPasswordLink>>(
      API_ROUTES.AUTH.SET_PASSWORD_CHECK,
      { token },
    )
    return response.data
  },

  setPassword: async (payload: { token: string; password: string }) => {
    await apiClient.post<ApiResponse<null>>(API_ROUTES.AUTH.SET_PASSWORD, payload)
  },

  logout: async () => {
    await apiClient.post<ApiResponse<null>>(API_ROUTES.AUTH.LOGOUT)
  },
}
