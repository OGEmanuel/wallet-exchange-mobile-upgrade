// types/storage-types.ts
/**
 * STORAGE TYPES
 *
 * This file contains storage-related types and interfaces for data persistence.
 * These are separate from core API models as they handle local data storage.
 *
 * Key characteristics:
 * - Local storage contracts
 * - Data persistence interfaces
 * - Storage key management
 * - Independent of API communication
 *
 * Used by: Storage services, data persistence, and local state management
 */

/**
 * Storage interface
 * Contract for local storage operations (AsyncStorage, SecureStore, etc.)
 */
export interface StorageInterface {
  getItem(key: string): Promise<string | null>; // Get item from storage
  setItem(key: string, value: string): Promise<void>; // Set item in storage
  removeItem(key: string): Promise<void>; // Remove item from storage
  clear(): Promise<void>; // Clear all storage
}

/**
 * Storage keys
 * Predefined keys for consistent storage access across the app
 */
export const StorageKeys = {
  USER_PROFILE: "userProfileDataKey", // User profile data
  TOKEN_DATA: "tokenDataKey", // Authentication tokens
  APP_THEME: "appTheme", // Application theme preference
  BIOMETRIC_ENABLED: "biometricEnabled", // Biometric authentication preference
  MAIN_WALLET_GROUP_ID: "mainWalletGroupId", // Currently selected main wallet group ID
  USER_WALLET_GROUPS: "userWalletGroups", // Cached user wallet groups data
  USER_WALLET_GROUPS_TIMESTAMP: "userWalletGroupsTimestamp", // Cache timestamp for wallet groups
  PORTFOLIO_DATA: "portfolioData", // Cached portfolio data
  PORTFOLIO_TIMESTAMP: "portfolioTimestamp", // Cache timestamp for portfolio
  PROCESSED_PORTFOLIO: "processedPortfolio", // Cached processed portfolio data
  PROCESSED_PORTFOLIO_TIMESTAMP: "processedPortfolioTimestamp", // Cache timestamp for processed portfolio
  AGGREGATED_BALANCES: "aggregatedBalances", // Cached aggregated wallet and wallet group balances
  AGGREGATED_BALANCES_TIMESTAMP: "aggregatedBalancesTimestamp", // Cache timestamp for aggregated balances
  EXCHANGE_AUTH_STATE: "exchangeAuthState", // Exchange authentication state
  PIN: "pin", // User PIN for authentication
  COLOR_THEME: "colorTheme",
  COLOR_THEME_USER_SET: "colorTheme_user_set",
  THEME_MODE: "themeMode", // "system" | "light" | "dark"
  HAPTICS_ENABLED: "hapticsEnabled", // "true" | "false"
  ANIMATIONS_ENABLED: "animationsEnabled", // "true" | "false"
  SELECTED_CURRENCY: "selected_Currency", // Selected currency for display
  // Note: Exchange user data is not cached locally; SDK caches it internally
} as const;

/**
 * Storage key type
 * Union type for all valid storage keys
 */
export type StorageKey = keyof typeof StorageKeys | string;
