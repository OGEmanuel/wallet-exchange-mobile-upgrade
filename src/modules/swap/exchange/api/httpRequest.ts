import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  CancelToken,
} from "axios"
import { tokenStorage } from "../../../services/httpClient"
import { BASE_URL } from "src/utils/config"

// Types for API requests and responses
export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export interface RequestConfig extends AxiosRequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  cancelToken?: CancelToken
  skipAuth?: boolean
  skipLogging?: boolean
}

// HTTP Request class for making different API calls
export class HttpRequest {
  private axiosInstance: AxiosInstance
  private baseURL: string
  private defaultTimeout: number = 10000 // 10 seconds
  private maxRetries: number = 3
  private retryDelay: number = 1000 // 1 second
  private activeRequests: Map<string, CancelToken> = new Map()

  constructor(baseURL: string = BASE_URL, config?: RequestConfig) {
    this.baseURL = baseURL

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: config?.timeout || this.defaultTimeout,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...config?.headers,
      },
    })

    this.setupInterceptors()
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Log request in development
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        console.error("❌ Request Error:", error)
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log response in development
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        }
        return response
      },
      (error) => {
        console.error("❌ Response Error:", error)
        return this.handleError(error)
      },
    )
  }

  // Get authentication token (implement based on your auth system)
  private getAuthToken(): string | null {
    console.log("tokenStorage.getAuthToken()", tokenStorage.getAuthToken())
    return tokenStorage.getAuthToken() || null
  }

  // Handle API errors
  private handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      message: error.message || "An unexpected error occurred",
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any
      apiError.message = responseData?.message || `Server Error: ${error.response.status}`
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = "Network Error: No response from server"
    }

    return Promise.reject(apiError)
  }

  // Retry mechanism for failed requests
  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.maxRetries,
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn()
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error as AxiosError)) {
        await this.delay(this.retryDelay)
        return this.retryRequest(requestFn, retries - 1)
      }
      throw error
    }
  }

  // Determine if request should be retried
  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    )
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Generic request method
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method,
        url,
        data,
        ...config,
      }

      const response = await this.retryRequest(
        () => this.axiosInstance.request<T>(requestConfig),
        config?.retries,
      )

      return {
        data: response.data,
        status: response.status,
        success: true,
      }
    } catch (error) {
      throw error
    }
  }

  // GET request
  async get<T>(url: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const requestConfig: RequestConfig = {
      ...config,
      params,
    }
    return this.request<T>("GET", url, undefined, requestConfig)
  }

  // POST request
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("POST", url, data, config)
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", url, data, config)
  }

  // PATCH request
  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", url, data, config)
  }

  // DELETE request
  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", url, undefined, config)
  }

  // Upload file
  async uploadFile<T>(
    url: string,
    file: FormData,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const uploadConfig: RequestConfig = {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    }

    return this.post<T>(url, file, uploadConfig)
  }

  // Download file
  async downloadFile(url: string, config?: RequestConfig): Promise<Blob> {
    const response = await this.axiosInstance.get(url, {
      ...config,
      responseType: "blob",
    })
    return response.data
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  // Remove authentication token
  removeAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common["Authorization"]
  }

  // Update base URL
  updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL
  }

  // Get axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

// Create default instance
export const httpRequest = new HttpRequest()

// Export individual methods for convenience
export const { get, post, put, patch, delete: del, uploadFile, downloadFile } = httpRequest
