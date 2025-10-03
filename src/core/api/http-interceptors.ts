// services/http-interceptors.ts
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpErrorHandler } from './http-error-handler';
import { CustomInternalAxiosRequestConfig, GeneralResponseErrorModel } from './http-types';
import { TokenManager } from './token-manager';



export class HttpInterceptors {
  private tokenManager: TokenManager;

  constructor(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
  }

  /**
   * Sets up request and response interceptors for an axios instance
   * @param axiosInstance - The axios instance to configure
   */
  setupInterceptors(axiosInstance: AxiosInstance): void {
    this.setupRequestInterceptor(axiosInstance);
    this.setupResponseInterceptor(axiosInstance);
  }

  /**
   * Sets up the request interceptor
   * @param axiosInstance - The axios instance
   */
  private setupRequestInterceptor(axiosInstance: AxiosInstance): void {
    axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig): Promise<CustomInternalAxiosRequestConfig> => {
        const customConfig = config as CustomInternalAxiosRequestConfig;

        // Add authorization token
        try {
          const tokenData = await this.tokenManager.getToken();
          if (tokenData?.token) {
            customConfig.headers.Authorization = `Bearer ${tokenData.token}`;
          }
        } catch (error) {
          console.warn('Failed to get token from storage:', error);
        }

        // Initialize metadata if not present
        if (!customConfig.metadata) {
          customConfig.metadata = {
            showErrorToast: null,
            skipRefreshToken: null,
            requestId: null,
            context: null,
            retryCount: null,
            timeout: null
          };
        }

        // Set default showErrorToast
        if (customConfig.metadata?.showErrorToast === undefined) {
          customConfig.metadata.showErrorToast = true;
        }

        // Clean request data (remove empty values)
        if (customConfig.data && !(customConfig.data instanceof FormData)) {
          customConfig.data = this.removeEmptyParams(customConfig.data);
        }

        if (customConfig.params) {
          customConfig.params = this.removeEmptyParams(customConfig.params);
        }



        // Log API request in development
        if (__DEV__) {
          console.log('🌐 API Request:', {
            method: customConfig.method?.toUpperCase(),
            url: customConfig.url,
            data: customConfig.data,
            params: customConfig.params,
            headers: customConfig.headers,
            metadata: customConfig.metadata,
            baseURL: customConfig.baseURL,
          });
        }

        return customConfig;
      },
      (error: AxiosError): Promise<never> => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Sets up the response interceptor
   * @param axiosInstance - The axios instance
   */
  private setupResponseInterceptor(axiosInstance: AxiosInstance): void {
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        // Attach metadata to response for access in calling code
        const config = response.config as CustomInternalAxiosRequestConfig;
        if (config.metadata) {
          (response as any).metadata = config.metadata;
        }



        // Log API response in development
        if (__DEV__) {
          console.log('✅ API Response:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
          });
        }

        return response;
      },
      async (error: AxiosError<GeneralResponseErrorModel>): Promise<any> => {
        const originalConfig = error.config as CustomInternalAxiosRequestConfig;
        const metadata = originalConfig?.metadata;

        // Skip refresh token handling for specific conditions
        const shouldSkipRefreshToken = HttpErrorHandler.shouldSkipRefreshToken(error, metadata);

        // Handle 401 errors with token refresh
        if (HttpErrorHandler.isUnauthorizedError(error) && !shouldSkipRefreshToken) {
          if (!this.tokenManager.isRefreshing()) {
            this.tokenManager.setRefreshing(true);

            try {
              const newToken = await this.tokenManager.refreshToken();
              this.tokenManager.setRefreshing(false);

              // Process pending requests
              this.tokenManager.processPendingRequests(newToken, axiosInstance);

              // Retry original request
              if (originalConfig && newToken) {
                originalConfig.headers.Authorization = `Bearer ${newToken}`;
                return await axiosInstance.request(originalConfig);
              }
            } catch (refreshError) {
              this.tokenManager.setRefreshing(false);
              this.tokenManager.rejectPendingRequests(refreshError);
              await this.tokenManager.handleAuthFailure();
              return Promise.reject(refreshError);
            }
          } else {
            // Queue request if refresh is in progress
            return new Promise((resolve, reject) => {
              this.tokenManager.addPendingRequest({
                resolve,
                reject,
                config: originalConfig
              });
            });
          }
        }

        // Handle other 401 responses
        if (HttpErrorHandler.isUnauthorizedError(error)) {
          await this.tokenManager.handleAuthFailure();
        }

        // Handle error with error handler
        return HttpErrorHandler.handleError(error, metadata);
      }
    );
  }

  /**
   * Removes empty parameters from request data
   * @param obj - The object to clean
   * @returns any - Cleaned object
   */
  private removeEmptyParams(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj
        .map(item => this.removeEmptyParams(item))
        .filter(item => item !== null && item !== '');
    }

    return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
      if (value === null || value === '') return acc;

      if (typeof value === 'object') {
        const cleanValue = this.removeEmptyParams(value);
        if (
          cleanValue !== null &&
          (Array.isArray(cleanValue) ? cleanValue.length > 0 : Object.keys(cleanValue).length > 0)
        ) {
          acc[key] = cleanValue;
        }
      } else {
        acc[key] = value;
      }

      return acc;
    }, {});
  }
} 
