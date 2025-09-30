// services/http.client.ts
import { ENVIRONMENTS } from "@/configs/environments";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HttpInterceptors } from "./http-interceptors";
import { HttpMethods } from "./http-methods";
import { HttpClientConfig } from "./http-types";
import { ApiRequestMetadata } from "./models";
import { TokenManager } from "./token-manager";

/**
 * HttpClient - A modular HTTP client with authentication, error handling, and request/response interceptors
 *
 * Features:
 * - Automatic token management and refresh
 * - Request/response interceptors
 * - Error handling with toast notifications
 * - File upload/download support
 * - Request metadata support
 *
 * @example
 * ```typescript
 * // Basic usage
 * const response = await httpClient.get('/api/users');
 *
 * // With parameters and metadata
 * const response = await httpClient.post('/api/users', userData, {
 *   headers: { 'Custom-Header': 'value' }
 * }, { showErrorToast: false });
 *
 * // File upload
 * const response = await httpClient.uploadFile('/api/upload', file);
 *
 * // File download
 * const response = await httpClient.downloadFile('/api/download');
 * ```
 */
class HttpClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private interceptors: HttpInterceptors;
  private methods: HttpMethods;

  private readonly baseURL: string;
  private readonly timeout: number;

  constructor(
    baseURL: string = ENVIRONMENTS.EXPO_PUBLIC_STAGING_BASE_URL ||
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "https://prod-backend-2.zap.africa",
      // "https://test-backend-2.zap.africa",
    timeout: number = 30000
  ) {
    this.baseURL = baseURL;
    this.timeout = timeout;

    // Initialize components
    this.tokenManager = new TokenManager(this.baseURL, 20000);
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
    });
    this.interceptors = new HttpInterceptors(this.tokenManager);
    this.methods = new HttpMethods(this.axiosInstance);

    // Setup interceptors
    this.interceptors.setupInterceptors(this.axiosInstance);
  }

  // Delegate HTTP methods to the methods class
  async request<T = any, P = any>(config: any): Promise<any> {
    return this.methods.request<T, P>(config);
  }

  async get<T>(
    url: string,
    params?: any,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.get<T>(url, params, options, metadata);
  }

  async post<T>(
    url: string,
    data?: any,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.post<T>(url, data, options, metadata);
  }

  async put<T>(
    url: string,
    data?: any,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.put<T>(url, data, options, metadata);
  }

  async patch<T>(
    url: string,
    data?: any,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.patch<T>(url, data, options, metadata);
  }

  async delete<T>(
    url: string,
    params?: any,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.delete<T>(url, params, options, metadata);
  }

  async head<T>(
    url: string,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.head<T>(url, options, metadata);
  }

  async options<T>(
    url: string,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.options<T>(url, options, metadata);
  }

  async uploadFile<T>(
    url: string,
    file: File | Blob,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.methods.uploadFile<T>(url, file, options, metadata);
  }

  async downloadFile(
    url: string,
    options?: any,
    metadata?: ApiRequestMetadata
  ): Promise<any> {
    return this.methods.downloadFile(url, options, metadata);
  }

  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  setTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Token management utilities
  async refreshToken(): Promise<string | null> {
    return this.tokenManager.refreshToken();
  }

  async getToken(): Promise<any> {
    return this.tokenManager.getToken();
  }

  async handleAuthFailure(): Promise<void> {
    return this.tokenManager.handleAuthFailure();
  }

  // Configuration methods
  updateConfig(config: Partial<HttpClientConfig>): void {
    if (config.baseURL) {
      this.axiosInstance.defaults.baseURL = config.baseURL;
    }
    if (config.timeout) {
      this.axiosInstance.defaults.timeout = config.timeout;
    }
  }

  // Cleanup method
  cleanup(): void {
    this.tokenManager.clearPendingRequests();
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
export default httpClient;
