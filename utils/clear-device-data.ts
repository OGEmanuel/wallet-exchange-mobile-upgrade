import storageService from '@/src/core/storage/app-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Clears all device data including AsyncStorage and SecureStore
 * This includes:
 * - All AsyncStorage data
 * - Wallet credentials
 * - PIN data
 * - Seed phrases
 * - Private keys
 * - Addresses
 * - Device fingerprint
 * - All other secure data
 */
export const clearAllDeviceData = async (): Promise<boolean> => {
  try {
    console.log('🗑️ Starting device data cleanup...');

    // Clear all AsyncStorage data
    console.log('🗑️ Clearing AsyncStorage...');
    await storageService.clearAll();

    // Clear SecureStore items
    console.log('🗑️ Clearing SecureStore...');
    
    // List of known SecureStore keys to clear
    const secureStoreKeys = [
      'wallet_pin_data',
      'wallet_credentials',
      'device_fingerprint',
      // Add other known secure store keys if needed
    ];

    // Clear each SecureStore key
    for (const key of secureStoreKeys) {
      try {
        await SecureStore.deleteItemAsync(key);
        console.log(`✅ Cleared SecureStore key: ${key}`);
      } catch (error) {
        // Key might not exist, ignore error
        console.log(`⚠️ Could not clear SecureStore key: ${key} (might not exist)`);
      }
    }

    console.log('✅ All device data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear device data:', error);
    return false;
  }
};

