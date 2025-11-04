// types/api.types.ts
/**
 * CORE API MODELS
 * 
 * This file contains the foundational API data structures and interfaces used across the application.
 * These are the "what" - the core contracts that define how data flows through the system.
 * 
 * Key characteristics:
 * - Application-wide API contracts
 * - Higher-level abstractions
 * - No external dependencies (standalone)
 * - Defines the shape of data and operations
 * 
 * Note: Socket types moved to socket-types.ts, Storage types moved to storage-types.ts
 * 
 * Used by: All modules, services, and components that need to interact with APIs
 */
/**
 * Request metadata for API calls
 * Controls behavior like error handling, token refresh, and request tracking
 */
export interface ApiRequestMetadata {
  showErrorToast?: boolean | null;      // Whether to show error toasts
  skipRefreshToken?: boolean | null;    // Skip automatic token refresh
  requestId?: string | null;            // Unique request identifier
  context?: any | null;                 // Additional context data
  retryCount?: number | null;           // Number of retry attempts
  timeout?: number | null;              // Request timeout in ms
  // [key: string]: any;
}

// export interface ApiResponse<T = any> {
//   data: T | null;
//   success: boolean | null;
//   message: string | null;
//   metadata: ApiRequestMetadata | null;
// }

/**
 * Server error response structure
 * Standardized error format returned by the API
 */
// export interface ServerError {
//   errors: string | string[] | null;    // Error messages (single or multiple)
//   message: string | null;              // Main error message
//   statusCode: number | null;           // HTTP status code
// }

/**
 * Authentication token data
 * Stores access token, refresh token, and expiration info
 */
export interface TokenData {
  token: string | null;                // Access token
  refreshToken: string | null;         // Refresh token for getting new access tokens
  expiresAt: number | null;            // Token expiration timestamp
}

/**
 * Generic HTTP request configuration
 * Enhanced Axios config with our custom metadata
 */
export interface CustomAxiosRequestConfig<T, P> {
  url: string | null;                  // Request URL
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | null;  // HTTP method
  data: T | null;                      // Request body data
  params: P | null;                    // Query parameters
  headers: Record<string, string> | null;  // Request headers
  timeout: number | null;              // Request timeout
  responseType: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream' | null;  // Expected response type
  metadata: ApiRequestMetadata | null; // Custom request metadata
}

/**
 * Storage interface
 * Contract for local storage operations (AsyncStorage, SecureStore, etc.)
 */
export interface StorageInterface {
  getItem(key: string): Promise<string | null>;    // Get item from storage
  setItem(key: string, value: string): Promise<void>; // Set item in storage
  removeItem(key: string): Promise<void>;          // Remove item from storage
  clear(): Promise<void>;                          // Clear all storage
}

/**
 * Storage keys
 * Predefined keys for consistent storage access across the app
 */
export const StorageKeys = {
  USER_PROFILE: "userProfileDataKey", // User profile data
  TOKEN_DATA: "tokenDataKey", // Authentication tokens
  APP_THEME: "appTheme",
  BIOMETRIC_ENABLED: "biometricEnabled", // Biometric authentication enabled
  MAIN_WALLET_GROUP_ID: "mainWalletGroupId", // Currently selected main wallet group ID
} as const;

/**
 * Storage key type
 * Union type for all valid storage keys
 */
export type StorageKey = keyof typeof StorageKeys | string;




