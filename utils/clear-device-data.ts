import storageService from '@/src/core/storage/app-storage';
import { StorageKeys } from '@/src/core/storage/storage-types';
import * as SecureStore from 'expo-secure-store';
import { resetAppState } from './reset-app-state';

/**
 * Logs out the user by clearing authentication and user data
 * This preserves device settings like theme, language, and biometric preferences
 */
export const logoutUser = async (): Promise<boolean> => {
  try {
    console.log('🚪 Starting user logout...');

    // Clear user authentication data
    console.log('🗑️ Clearing user authentication data...');
    await storageService.remove(StorageKeys.TOKEN_DATA);
    await storageService.remove(StorageKeys.USER_PROFILE);
    await storageService.remove(StorageKeys.EXCHANGE_AUTH_STATE);
    
    // Clear cached user data
    await storageService.remove(StorageKeys.USER_WALLET_GROUPS);
    await storageService.remove(StorageKeys.USER_WALLET_GROUPS_TIMESTAMP);
    await storageService.remove(StorageKeys.PORTFOLIO_DATA);
    await storageService.remove(StorageKeys.PORTFOLIO_TIMESTAMP);
    await storageService.remove(StorageKeys.PROCESSED_PORTFOLIO);
    await storageService.remove(StorageKeys.PROCESSED_PORTFOLIO_TIMESTAMP);
    await storageService.remove(StorageKeys.AGGREGATED_BALANCES);
    await storageService.remove(StorageKeys.AGGREGATED_BALANCES_TIMESTAMP);
    await storageService.remove(StorageKeys.MAIN_WALLET_GROUP_ID);

    // Clear cached auth user IDs
    console.log('🗑️ Clearing cached auth user IDs...');
    await SecureStore.deleteItemAsync(StorageKeys.WALLET_USER_ID).catch(() => {});
    await SecureStore.deleteItemAsync(StorageKeys.EXCHANGE_USER_ID).catch(() => {});

    // Clear sensitive SecureStore data
    console.log('🗑️ Clearing secure data...');
    const secureStoreKeys = [
      'wallet_pin_data',
      'wallet_credentials',
      'device_fingerprint',
    ];

    for (const key of secureStoreKeys) {
      try {
        await SecureStore.deleteItemAsync(key);
        console.log(`✅ Cleared SecureStore key: ${key}`);
      } catch (error) {
        console.log(`⚠️ Could not clear SecureStore key: ${key} (might not exist)`);
      }
    }

    // Reset Redux state to initial values
    console.log('🔄 Resetting app state...');
    resetAppState();

    // Note: We preserve device settings like:
    // - APP_THEME (user's theme preference)
    // - BIOMETRIC_ENABLED (biometric preference)
    // - Language preferences
    // - Other non-sensitive app settings

    console.log('✅ User logged out successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to logout user:', error);
    return false;
  }
};

/**
 * Clears all device data including AsyncStorage and SecureStore
 * This is a complete reset - use with caution
 */
export const clearAllDeviceData = async (): Promise<boolean> => {
  try {
    console.log('🗑️ Starting complete device data cleanup...');

    // Clear all AsyncStorage data
    await storageService.clearAll();

    // Clear all SecureStore items
    const secureStoreKeys = [
      'wallet_pin_data',
      'wallet_credentials',
      'device_fingerprint',
    ];

    for (const key of secureStoreKeys) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        // Ignore errors for keys that don't exist
      }
    }

    console.log('✅ All device data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear device data:', error);
    return false;
  }
};

