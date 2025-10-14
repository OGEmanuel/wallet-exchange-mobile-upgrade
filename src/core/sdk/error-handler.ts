/**
 * SDK Error Handler
 * 
 * Centralized error handling for Zap SDK operations
 */

export interface SDKError {
  code: string;
  message: string;
  status?: number;
  isRetryable: boolean;
  originalError?: any;
}

export class ZapSDKError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly isRetryable: boolean;
  public readonly originalError?: any;

  constructor(error: SDKError) {
    super(error.message);
    this.name = 'ZapSDKError';
    this.code = error.code;
    this.status = error.status;
    this.isRetryable = error.isRetryable;
    this.originalError = error.originalError;
  }
}

export const handleSDKError = (error: any): ZapSDKError => {
  console.error('SDK Error:', error);

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    return new ZapSDKError({
      code: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      isRetryable: true,
      originalError: error,
    });
  }

  // Authentication errors
  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    return new ZapSDKError({
      code: 'AUTHENTICATION_ERROR',
      message: 'Authentication failed. Please log in again.',
      status: 401,
      isRetryable: false,
      originalError: error,
    });
  }

  // Rate limiting
  if (error.status === 429 || error.code === 'RATE_LIMITED') {
    return new ZapSDKError({
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait a moment and try again.',
      status: 429,
      isRetryable: true,
      originalError: error,
    });
  }

  // Validation errors
  if (error.status === 400 || error.code === 'VALIDATION_ERROR') {
    return new ZapSDKError({
      code: 'VALIDATION_ERROR',
      message: error.message || 'Invalid input. Please check your data.',
      status: 400,
      isRetryable: false,
      originalError: error,
    });
  }

  // Server errors
  if (error.status >= 500) {
    return new ZapSDKError({
      code: 'SERVER_ERROR',
      message: 'Server error. Please try again later.',
      status: error.status,
      isRetryable: true,
      originalError: error,
    });
  }

  // Default error
  return new ZapSDKError({
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred.',
    isRetryable: false,
    originalError: error,
  });
};

export const isRetryableError = (error: ZapSDKError): boolean => {
  return error.isRetryable;
};

export const getErrorMessage = (error: ZapSDKError): string => {
  return error.message;
};

export const getErrorCode = (error: ZapSDKError): string => {
  return error.code;
};

export const shouldRetry = (error: ZapSDKError, attempt: number, maxAttempts: number = 3): boolean => {
  return isRetryableError(error) && attempt < maxAttempts;
};

export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
};

export default {
  handleSDKError,
  isRetryableError,
  getErrorMessage,
  getErrorCode,
  shouldRetry,
  getRetryDelay,
};
