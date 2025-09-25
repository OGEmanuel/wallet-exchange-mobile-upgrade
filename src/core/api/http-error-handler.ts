// services/http-error-handler.ts
import { AxiosError } from 'axios';
import { isNetworkAvailable } from '../utils/network-utils';
import { showErrorToast } from '../utils/toast-utils';
import { ErrorCategory, errorReportingService, ErrorSeverity } from './error-reporting';
import { DEFAULT_ERROR_MESSAGES, GeneralResponseErrorModel } from './http-types';

/**
 * HTTP Error Handler
 * 
 * Provides comprehensive error handling for HTTP requests with:
 * - Specific error messages based on context
 * - Error recovery strategies
 * - External error reporting
 * - Retry logic for transient errors
 * 
 * @example
 * ```typescript
 * const error = await HttpErrorHandler.handleError(axiosError, metadata);
 * ```
 */
export class HttpErrorHandler {
  /**
   * Processes and handles HTTP errors with comprehensive error recovery
   * @param error - The axios error
   * @param metadata - Request metadata for error handling
   * @returns Promise<never> - Always rejects with enhanced error
   */
  static async handleError(error: AxiosError<GeneralResponseErrorModel>, metadata?: any): Promise<never> {
    const errorMessage = await this.getErrorMessage(error, metadata);
    const errorSeverity = this.getErrorSeverity(error);
    const errorCategory = this.getErrorCategory(error);
    
    // Report error to external services
    await this.reportError(error, errorSeverity, errorCategory, metadata);

    console.log("metadata", metadata);

    // Show error toast if enabled
    if (metadata?.showErrorToast !== false) {
      showErrorToast(errorMessage);
    }

    // Attach metadata to error
    const enhancedError = error as any;
    enhancedError.metadata = metadata;
    enhancedError.message = errorMessage;
    enhancedError.severity = errorSeverity;
    enhancedError.category = errorCategory;
    enhancedError.recoverable = this.isRecoverableError(error);

    return Promise.reject(enhancedError);
  }

  /**
   * Extracts and formats error messages from axios errors with context-specific messages
   * @param error - The axios error
   * @param metadata - Request metadata for context
   * @returns Promise<string> - Formatted error message
   */
  static async getErrorMessage(error: AxiosError<GeneralResponseErrorModel>, metadata?: any): Promise<string> {
    if (error.response) {
      const serverError = error.response.data;
      const status = error.response.status;
      const url = error.config?.url || 'unknown endpoint';
      
      // Try to get server message first
      let serverMessage: string | null = null;
      if (serverError?.errors) {
        if (Array.isArray(serverError.errors) && serverError.errors.length > 0) {
          serverMessage = serverError.errors[0];
        } else if (typeof serverError.errors === 'string') {
          serverMessage = serverError.errors;
        }
      }

      if (!serverMessage) {
        serverMessage = serverError?.message || null;
      }

      // Return server message if available, otherwise use contextual default
      if (serverMessage) {
        return serverMessage;
      }

      // Context-specific error messages
      const contextualMessage = this.getContextualErrorMessage(status, url, metadata);
      return contextualMessage || DEFAULT_ERROR_MESSAGES[status] || 'An unexpected error occurred. Please try again.';
    }

    if (error.request) {
      // Network error with context
      const isTimeout = error.code === 'ECONNABORTED';
      const isOffline = await this.isOffline();
      
      if (isTimeout) {
        return 'Request timed out. Please check your connection and try again.';
      }
      
      if (isOffline) {
        return 'You appear to be offline. Please check your internet connection and try again.';
      }
      
      return 'Network error. Please check your connection and try again.';
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get contextual error messages based on status code and endpoint
   */
  private static getContextualErrorMessage(status: number, url: string, metadata?: any): string | null {
    const endpoint = url.split('/').pop() || '';
    
    switch (status) {
      case 400:
        if (endpoint.includes('auth') || endpoint.includes('login')) {
          return 'Invalid login credentials. Please check your email and password.';
        }
        if (endpoint.includes('wallet')) {
          return 'Invalid wallet information. Please check your input and try again.';
        }
        return 'Invalid request. Please check your input and try again.';
        
      case 401:
        if (endpoint.includes('refresh')) {
          return 'Your session has expired. Please log in again.';
        }
        return 'Authentication required. Please log in to continue.';
        
      case 403:
        if (endpoint.includes('wallet')) {
          return 'You don\'t have permission to access this wallet.';
        }
        return 'Access denied. You don\'t have permission to perform this action.';
        
      case 404:
        if (endpoint.includes('wallet')) {
          return 'Wallet not found. Please check your wallet address.';
        }
        return 'Resource not found. Please try again.';
        
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
        
      case 500:
        return 'Server error. Our team has been notified. Please try again later.';
        
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
        
      default:
        return null;
    }
  }

  /**
   * Checks if an error should skip token refresh handling
   * @param error - The axios error
   * @param metadata - Request metadata
   * @returns boolean - True if should skip refresh
   */
  static shouldSkipRefreshToken(error: AxiosError<GeneralResponseErrorModel>, metadata?: any): boolean {
    return !error.config ||
           metadata?.skipRefreshToken ||
           error.config?.url?.includes('/auth/refresh');
  }

  /**
   * Checks if an error is a 401 unauthorized error
   * @param error - The axios error
   * @returns boolean - True if 401 error
   */
  static isUnauthorizedError(error: AxiosError<GeneralResponseErrorModel>): boolean {
    return error.response?.status === 401;
  }

  /**
   * Checks if an error is a network error (no response)
   * @param error - The axios error
   * @returns boolean - True if network error
   */
  static isNetworkError(error: AxiosError<GeneralResponseErrorModel>): boolean {
    return !error.response && error.request;
  }

  /**
   * Gets the HTTP status code from an error
   * @param error - The axios error
   * @returns number | undefined - HTTP status code
   */
  static getStatusCode(error: AxiosError<GeneralResponseErrorModel>): number | undefined {
    return error.response?.status;
  }

  /**
   * Gets the server error data from an error
   * @param error - The axios error
   * @returns GeneralResponseErrorModel | undefined - Server error data
   */
  static getServerError(error: AxiosError<GeneralResponseErrorModel>): GeneralResponseErrorModel | undefined {
    return error.response?.data;
  }

  /**
   * Determines error severity based on status code and error type
   * @param error - The axios error
   * @returns ErrorSeverity - The severity level
   */
  static getErrorSeverity(error: AxiosError<GeneralResponseErrorModel>): ErrorSeverity {
    if (error.response) {
      const status = error.response.status;
      
      if (status >= 500) return ErrorSeverity.HIGH;
      if (status === 401 || status === 403) return ErrorSeverity.MEDIUM;
      if (status === 429) return ErrorSeverity.LOW;
      if (status >= 400) return ErrorSeverity.MEDIUM;
    }
    
    if (error.request) return ErrorSeverity.MEDIUM;
    
    return ErrorSeverity.LOW;
  }

  /**
   * Determines error category based on error type and context
   * @param error - The axios error
   * @returns ErrorCategory - The error category
   */
  static getErrorCategory(error: AxiosError<GeneralResponseErrorModel>): ErrorCategory {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';
      
      if (status === 401 || status === 403) return ErrorCategory.AUTHENTICATION;
      if (url.includes('wallet')) return ErrorCategory.API;
      if (status >= 400 && status < 500) return ErrorCategory.VALIDATION;
      if (status >= 500) return ErrorCategory.API;
    }
    
    if (error.request) return ErrorCategory.NETWORK;
    
    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determines if an error is recoverable (can be retried)
   * @param error - The axios error
   * @returns boolean - True if error is recoverable
   */
  static isRecoverableError(error: AxiosError<GeneralResponseErrorModel>): boolean {
    if (error.response) {
      const status = error.response.status;
      // 5xx errors and rate limiting are recoverable
      return status >= 500 || status === 429;
    }
    
    // Network errors are recoverable
    if (error.request) return true;
    
    return false;
  }

  /**
   * Checks if the device is offline (React Native compatible)
   * @returns Promise<boolean> - True if offline
   */
  private static async isOffline(): Promise<boolean> {
    try {
      const isOnline = await isNetworkAvailable();
      return !isOnline;
    } catch (error) {
      console.warn('Failed to check network status:', error);
      return false; // Assume online on error
    }
  }

  /**
   * Reports error to external services
   * @param error - The axios error
   * @param severity - Error severity
   * @param category - Error category
   * @param metadata - Request metadata
   */
  private static async reportError(
    error: AxiosError<GeneralResponseErrorModel>,
    severity: ErrorSeverity,
    category: ErrorCategory,
    metadata?: any
  ): Promise<void> {
    try {
      await errorReportingService.reportError(
        error,
        severity,
        category,
        {
          url: error.config?.url,
          action: metadata?.context?.action
        },
        {
          requestData: error.config?.data,
          responseData: error.response?.data,
          headers: error.config?.headers
        }
      );
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
} 

