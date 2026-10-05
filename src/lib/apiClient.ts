import { API_ROUTES } from '@/constants/apiRoutes'
import { API_CONFIG, AUTH_EVENTS } from '@/constants/constant'
import { refreshSession } from '@/lib/sessionRefresh'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    // Set once a request has been retried after a refresh, so it can never loop.
    _retried?: boolean
  }
}

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiError extends Error {
  message: string
  status: number
  code: string
  details?: ApiErrorDetail[]
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiResponse<T = unknown> {
  success: true
  message?: string
  data: T
}

export interface PaginatedApiResponse<T = unknown> {
  success: true
  message?: string
  data: T[]
  pagination: Pagination
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: Pagination
}

export function handleApiError(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    return error.message
  }
  return fallbackMessage
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toDetails(value: unknown): ApiErrorDetail[] | undefined {
  if (!Array.isArray(value)) return undefined
  const details = value.filter(
    (item): item is ApiErrorDetail =>
      isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string',
  )
  return details.length > 0 ? details : undefined
}

export function createApiError(status: number, data: unknown): ApiError {
  const body = isRecord(data) && isRecord(data.error) ? data.error : {}
  const apiMessage = body.message
  const message =
    typeof apiMessage === 'string' && apiMessage.trim().length > 0
      ? apiMessage
      : `HTTP error! status: ${status}`

  const error = new Error(message) as ApiError
  error.status = status
  error.code = typeof body.code === 'string' ? body.code : 'UNKNOWN_ERROR'
  error.details = toDetails(body.details)
  return error
}

// A 401 from sign-in means wrong credentials, and a 401 from refresh means the session is over.
// Neither is fixed by refreshing.
function canRefresh(url: string | undefined): boolean {
  return url !== API_ROUTES.AUTH.LOGIN && url !== API_ROUTES.AUTH.REFRESH
}

class ApiClient {
  private readonly axiosInstance: AxiosInstance

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_CONFIG.API_CUSTOM_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!navigator.onLine) {
          throw new Error('No internet connection')
        }
        return config
      },
      (error: unknown) => {
        throw error
      },
    )

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
          throw error
        }

        const { config } = error
        if (
          error.response?.status === 401 &&
          config &&
          !config._retried &&
          canRefresh(config.url)
        ) {
          config._retried = true
          try {
            await refreshSession(() => this.refresh())
          } catch (refreshError) {
            window.dispatchEvent(new Event(AUTH_EVENTS.FORCE_LOGOUT))
            throw refreshError
          }
          try {
            return await this.axiosInstance(config)
          } catch (retryError) {
            // Still unauthorized right after a refresh: the session is not recoverable.
            if (isApiError(retryError) && retryError.status === 401) {
              window.dispatchEvent(new Event(AUTH_EVENTS.FORCE_LOGOUT))
            }
            throw retryError
          }
        }

        if (error.response) {
          throw createApiError(error.response.status, error.response.data)
        }

        throw createApiError(0, {
          error: {
            code: 'NETWORK_ERROR',
            message: 'Unable to reach the server',
          },
        })
      },
    )
  }

  // Rotates both cookies. Goes through the interceptors, so a 401 here becomes an ApiError.
  private async refresh(): Promise<void> {
    await this.axiosInstance.post(API_ROUTES.AUTH.REFRESH)
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config)
    return response.data
  }

  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config)
    return response.data
  }

  async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config)
    return response.data
  }

  async patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, config)
    return response.data
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
