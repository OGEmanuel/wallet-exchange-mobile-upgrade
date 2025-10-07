import { ENVIRONMENTS } from "@/configs/environments";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelToken,
} from "axios";
import { TokenManager } from "../../../../core/api/token-manager";
import { storageService } from "../../../../core/storage/app-storage";
import { StorageKeys } from "../../../../core/storage/storage-types";

// Types for API requests and responses
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface RequestConfig extends AxiosRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cancelToken?: CancelToken;
  skipAuth?: boolean;
  skipLogging?: boolean;
  metadata?: {
    requestId: string;
    startTime: number;
  };
}

// HTTP Request class for making different API calls
export class SwapApiService {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private tokenManager: TokenManager;
  private defaultTimeout: number = 10000; // 10 seconds
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second
  private activeRequests: Map<string, CancelToken> = new Map();

  constructor(
    baseURL: string = ENVIRONMENTS.EXPO_PUBLIC_STAGING_BASE_URL ||
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "https://test-backend-2.zap.africa",
    config?: RequestConfig
  ) {
    this.baseURL = baseURL;
    this.tokenManager = new TokenManager(this.baseURL, 20000);

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: config?.timeout || this.defaultTimeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...config?.headers,
      },
    });

    this.setupInterceptors();
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Enhanced request logging
        const fullUrl = `${config.baseURL}${config.url}`;
        const requestId = Math.random().toString(36).substr(2, 9);
        (config as any).metadata = { requestId, startTime: Date.now() };

        console.log(`🚀 [${requestId}] API Request:`, {
          method: config.method?.toUpperCase(),
          url: fullUrl,
          route: config.url,
          baseURL: config.baseURL,
          headers: {
            ...config.headers,
            Authorization: token
              ? `Bearer ${token.substring(0, 20)}...`
              : "None",
          },
          data: config.data ? JSON.stringify(config.data, null, 2) : "No body",
          params: config.params,
        });

        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const requestId = (response.config as any).metadata?.requestId;
        const duration = (response.config as any).metadata?.startTime
          ? Date.now() - (response.config as any).metadata.startTime
          : "Unknown";

        console.log(`✅ [${requestId}] API Response:`, {
          status: response.status,
          statusText: response.statusText,
          url: `${response.config.baseURL}${response.config.url}`,
          route: response.config.url,
          duration: `${duration}ms`,
          headers: response.headers,
          data: response.data
            ? JSON.stringify(response.data, null, 2)
            : "No response body",
          requestData: response.config.data
            ? JSON.stringify(response.config.data, null, 2)
            : "No request body",
        });

        return response;
      },
      (error) => {
        const requestId = (error.config as any)?.metadata?.requestId;
        const duration = (error.config as any)?.metadata?.startTime
          ? Date.now() - (error.config as any).metadata.startTime
          : "Unknown";

        console.error(`❌ [${requestId}] API Error:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config
            ? `${error.config.baseURL}${error.config.url}`
            : "Unknown",
          route: error.config?.url,
          duration: `${duration}ms`,
          message: error.message,
          responseData: error.response?.data
            ? JSON.stringify(error.response.data, null, 2)
            : "No error response body",
          requestData: error.config?.data
            ? JSON.stringify(error.config.data, null, 2)
            : "No request body",
        });

        return this.handleError(error);
      }
    );
  }

  // Get authentication token (implement based on your auth system)
  private async getAuthToken(): Promise<string | null> {
    try {
      const tokenData = await this.tokenManager.getToken();
      console.log("TokenManager.getToken()", tokenData);
      return tokenData?.token || null;
    } catch (error) {
      console.warn("Failed to get token from storage:", error);
      return null;
    }
  }

  // Handle API errors
  private handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      message: error.message || "An unexpected error occurred",
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    };

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      apiError.message =
        responseData?.message || `Server Error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = "Network Error: No response from server";
    }

    return Promise.reject(apiError);
  }

  // Retry mechanism for failed requests
  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.maxRetries
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error as AxiosError)) {
        await this.delay(this.retryDelay);
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  // Determine if request should be retried
  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    );
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Generic request method
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method,
        url,
        data,
        ...config,
      };

      const response = await this.retryRequest(
        () => this.axiosInstance.request<T>(requestConfig),
        config?.retries
      );

      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // GET request
  async get<T>(
    url: string,
    params?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const requestConfig: RequestConfig = {
      ...config,
      params,
    };
    return this.request<T>("GET", url, undefined, requestConfig);
  }

  // POST request
  async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", url, data, config);
  }

  // PUT request
  async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", url, data, config);
  }

  // PATCH request
  async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", url, data, config);
  }

  // DELETE request
  async delete<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", url, undefined, config);
  }

  // Upload file
  async uploadFile<T>(
    url: string,
    file: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const uploadConfig: RequestConfig = {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    };

    return this.post<T>(url, file, uploadConfig);
  }

  // Download file
  async downloadFile(url: string, config?: RequestConfig): Promise<Blob> {
    const response = await this.axiosInstance.get(url, {
      ...config,
      responseType: "blob",
    });
    return response.data;
  }

  // Set authentication token
  async setAuthToken(token: string, refreshToken?: string): Promise<void> {
    this.axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
    // Store token in storage for consistency
    await storageService.save(StorageKeys.TOKEN_DATA, {
      token,
      refreshToken: refreshToken || "",
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    });
  }

  // Remove authentication token
  async removeAuthToken(): Promise<void> {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
    // Also clear from TokenManager for consistency
    await this.tokenManager.handleAuthFailure();
  }

  // Update base URL
  updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  // Get axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Create default instance
export const swapApiService = new SwapApiService();

// Export individual methods for convenience
export const {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  downloadFile,
} = swapApiService;
