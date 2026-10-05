import { API_CONFIG } from '@/constants/constant'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'

export interface ApiError extends Error {
  message: string
  status: number
  code: string
  details?: unknown
}

export interface ApiResponse<T = unknown> {
  data: T
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
  error.details = data
  return error
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
      (error: unknown) => {
        if (!axios.isAxiosError(error)) {
          throw error
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
