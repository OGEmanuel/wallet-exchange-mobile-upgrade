import { Alert } from 'react-native';

export interface NetworkError {
  code?: string;
  message: string;
  isNetworkError: boolean;
  isTimeoutError: boolean;
  isServerError: boolean;
}

export class NetworkErrorHandler {
  /**
   * Check if an error is a network-related error
   */
  static isNetworkError(error: any): boolean {
    if (!error) return false;

    // Check for common network error patterns
    const networkErrorPatterns = [
      'Network request failed',
      'Network Error',
      'fetch failed',
      'Connection failed',
      'No internet connection',
      'Unable to resolve host',
      'timeout',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ECONNRESET',
      'ETIMEDOUT',
    ];

    const errorMessage = error.message || error.toString() || '';
    const errorCode = error.code || '';

    return networkErrorPatterns.some(pattern =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase()) ||
      errorCode.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Check if an error is a timeout error
   */
  static isTimeoutError(error: any): boolean {
    if (!error) return false;

    const timeoutPatterns = ['timeout', 'ETIMEDOUT', 'Request timeout'];
    const errorMessage = error.message || error.toString() || '';

    return timeoutPatterns.some(pattern =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Check if an error is a server error (5xx)
   */
  static isServerError(error: any): boolean {
    if (!error) return false;

    const status = error.status || error.statusCode || error.response?.status;
    return status >= 500 && status < 600;
  }

  /**
   * Parse error and return structured network error info
   */
  static parseError(error: any): NetworkError {
    const isNetwork = this.isNetworkError(error);
    const isTimeout = this.isTimeoutError(error);
    const isServer = this.isServerError(error);

    let message = 'An unexpected error occurred';

    if (isNetwork) {
      if (isTimeout) {
        message = 'Request timed out. Please check your connection and try again.';
      } else {
        message = 'Network error. Please check your internet connection.';
      }
    } else if (isServer) {
      message = error.message || 'Server error. Please try again later.';
    } else if (error.message) {
      message = error.message;
    }

    return {
      code: error.code || error.status,
      message,
      isNetworkError: isNetwork,
      isTimeoutError: isTimeout,
      isServerError: isServer,
    };
  }

  /**
   * Show network error alert
   */
  static showNetworkErrorAlert(error: any, onRetry?: () => void) {
    const networkError = this.parseError(error);

    const buttons = [
      { text: 'OK', style: 'default' as const }
    ];

    if (onRetry && networkError.isNetworkError) {
      buttons.unshift({ text: 'Retry', style: 'default' as const });
    }

    Alert.alert(
      'Connection Error',
      networkError.message,
      buttons,
      { cancelable: true }
    );
  }

  /**
   * Handle SDK errors with network detection
   */
  static handleSDKError(error: any, context: string = 'SDK call'): NetworkError {
    console.error(`❌ ${context} failed:`, error);

    const networkError = this.parseError(error);

    if (networkError.isNetworkError) {
      console.error(`🌐 Network error in ${context}:`, networkError.message);
    } else if (networkError.isServerError) {
      console.error(`🖥️ Server error in ${context}:`, networkError.message);
    } else {
      console.error(`⚠️ Unexpected error in ${context}:`, networkError.message);
    }

    return networkError;
  }

  /**
   * Retry function with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry if it's not a network error
        if (!this.isNetworkError(error)) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`🔄 Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

export default NetworkErrorHandler;
