// services/http-methods.ts
import { AxiosInstance, AxiosResponse } from 'axios';
import { ApiRequestMetadata, CustomAxiosRequestConfig } from './models';

export class HttpMethods {
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * Makes a generic HTTP request
   * @param config - The request configuration
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async request<T = any, P = any>(config: CustomAxiosRequestConfig<T, P>): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config as any);
  }

  /**
   * Makes a GET request
   * @param url - The request URL
   * @param params - Query parameters
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async get<T = any>(
    url: string,
    params?: any,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method' | 'params'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      data: options?.data || null,
      params: params || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: { 
        showErrorToast: null,
        skipRefreshToken: null,
        requestId: null,
        context: null,
        retryCount: null,
        timeout: null,
        ...options?.metadata, 
        ...metadata 
      }
    });
  }

  /**
   * Makes a POST request
   * @param url - The request URL
   * @param data - Request body data
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async post<T = any>(
    url: string,
    data?: any,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method' | 'data'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data: data || null,
      params: options?.params || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: { 
        showErrorToast: null,
        skipRefreshToken: null,
        requestId: null,
        context: null,
        retryCount: null,
        timeout: null,
        ...options?.metadata, 
        ...metadata 
      }
    });
  }

  /**
   * Makes a PUT request
   * @param url - The request URL
   * @param data - Request body data
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async put<T = any>(
    url: string,
    data?: any,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method' | 'data'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data: data || null,
      params: options?.params || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: { 
        showErrorToast: null,
        skipRefreshToken: null,
        requestId: null,
        context: null,
        retryCount: null,
        timeout: null,
        ...options?.metadata, 
        ...metadata 
      }
    });
  }

  /**
   * Makes a PATCH request
   * @param url - The request URL
   * @param data - Request body data
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method' | 'data'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data: data || null,
      params: options?.params || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: { 
        showErrorToast: null,
        skipRefreshToken: null,
        requestId: null,
        context: null,
        retryCount: null,
        timeout: null,
        ...options?.metadata, 
        ...metadata 
      }
    });
  }

  /**
   * Makes a DELETE request
   * @param url - The request URL
   * @param params - Query parameters
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async delete<T = any>(
    url: string,
    params?: any,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method' | 'params'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      data: options?.data || null,
      params: params || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: { 
        showErrorToast: null,
        skipRefreshToken: null,
        requestId: null,
        context: null,
        retryCount: null,
        timeout: null,
        ...options?.metadata, 
        ...metadata 
      }
    });
  }

  /**
   * Makes a HEAD request
   * @param url - The request URL
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async head<T = any>(
    url: string,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      url,
      method: 'HEAD',
      data: options?.data || null,
      params: options?.params || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: { 
        showErrorToast: null,
        skipRefreshToken: null,
        requestId: null,
        context: null,
        retryCount: null,
        timeout: null,
        ...options?.metadata, 
        ...metadata 
      }
    });
  }

  /**
   * Makes an OPTIONS request
   * @param url - The request URL
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async options<T = any>(
    url: string,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      url,
      method: 'OPTIONS',
      data: options?.data || null,
      params: options?.params || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: { 
        showErrorToast: null,
        skipRefreshToken: null,
        requestId: null,
        context: null,
        retryCount: null,
        timeout: null,
        ...options?.metadata, 
        ...metadata 
      }
    });
  }

  /**
   * Uploads a file using POST request
   * @param url - The request URL
   * @param file - The file to upload
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<T>> - The response
   */
  async uploadFile<T = any>(
    url: string,
    file: File | Blob,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method' | 'data'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<T>(url, formData, {
      params: options?.params || null,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(options?.headers || {}),
      },
      timeout: options?.timeout || null,
      responseType: options?.responseType || null,
      metadata: options?.metadata || null,
    }, metadata);
  }

  /**
   * Downloads a file
   * @param url - The request URL
   * @param options - Additional request options
   * @param metadata - Request metadata
   * @returns Promise<AxiosResponse<Blob>> - The response with blob data
   */
  async downloadFile(
    url: string,
    options?: Omit<CustomAxiosRequestConfig<any, any>, 'url' | 'method'>,
    metadata?: ApiRequestMetadata
  ): Promise<AxiosResponse<Blob>> {
    return this.get<Blob>(url, undefined, {
      data: options?.data || null,
      headers: options?.headers || null,
      timeout: options?.timeout || null,
      responseType: 'blob',
      metadata: options?.metadata || null,
    }, metadata);
  }
} 
