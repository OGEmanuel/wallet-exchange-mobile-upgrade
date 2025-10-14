/**
 * Retry Utilities for SDK Operations
 * 
 * Provides retry logic with exponential backoff for SDK operations
 */

import { handleSDKError, shouldRetry, ZapSDKError } from './error-handler';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: ZapSDKError) => boolean;
}

export const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const config = { ...defaultRetryOptions, ...options };
  let lastError: ZapSDKError;

  for (let attempt = 0; attempt < config.maxAttempts!; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleSDKError(error);
      
      // Check if we should retry
      const shouldRetryOperation = shouldRetry(lastError, attempt, config.maxAttempts);
      const customRetryCondition = config.retryCondition ? config.retryCondition(lastError) : true;
      
      if (!shouldRetryOperation || !customRetryCondition) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay! * Math.pow(2, attempt),
        config.maxDelay!
      );

      console.log(`Retry attempt ${attempt + 1}/${config.maxAttempts} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError!;
};

export const withRetryAsync = <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) => {
  return withRetry(operation, options);
};

export const createRetryableOperation = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) => {
  return async (...args: T): Promise<R> => {
    return withRetry(() => operation(...args), options);
  };
};

export default {
  withRetry,
  withRetryAsync,
  createRetryableOperation,
  sleep,
};
