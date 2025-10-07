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
  USER_PROFILE: "userProfileDataKey",              // User profile data
  TOKEN_DATA: "tokenDataKey",                      // Authentication tokens
  APP_THEME: "appTheme",                           // Application theme preference
} as const;

/**
 * Storage key type
 * Union type for all valid storage keys
 */
export type StorageKey = keyof typeof StorageKeys | string;
