// services/http-error-handler.ts
import { AxiosError } from 'axios';
import { showErrorToast } from '../utils/toast-utils';
import { DEFAULT_ERROR_MESSAGES, GeneralResponseErrorModel } from './http-types';

export class HttpErrorHandler {
  /**
   * Processes and handles HTTP errors
   * @param error - The axios error
   * @param metadata - Request metadata for error handling
   * @returns Promise<never> - Always rejects with enhanced error
   */
  static async handleError(error: AxiosError<GeneralResponseErrorModel>, metadata?: any): Promise<never> {
    // Show error toast if enabled
    if (metadata?.showErrorToast) {
      const errorMessage = this.getErrorMessage(error);
      showErrorToast(errorMessage);
    }

    // Attach metadata to error
    const enhancedError = error as any;
    enhancedError.metadata = metadata;
    enhancedError.message = this.getErrorMessage(error);

    return Promise.reject(enhancedError);
  }

  /**
   * Extracts and formats error messages from axios errors
   * @param error - The axios error
   * @returns string - Formatted error message
   */
  static getErrorMessage(error: AxiosError<GeneralResponseErrorModel>): string {
    if (error.response) {
      const serverError = error.response.data;
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

      const status = error.response.status;
      return serverMessage || DEFAULT_ERROR_MESSAGES[status] || 'An unexpected error occurred. Please try again.';
    }

    if (error.request) {
      return 'Network error. Please check your connection and try again.';
    }

    return error.message || 'An unexpected error occurred. Please try again.';
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
} 

