// services/storage.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageInterface, StorageKey, StorageKeys } from '../api/models';

class StorageService implements StorageInterface {
  private prefix = '@ZapExchange:';

  private getKey(key: StorageKey): string {
    const storageKey = typeof key === 'string' ? key : StorageKeys[key];
    return `${this.prefix}${storageKey}`;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.getKey(key));
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  // Type-safe methods
  async save<T>(key: StorageKey, value: T): Promise<boolean> {
    try {
      const storageKey = typeof key === 'string' ? key : StorageKeys[key];
      await this.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const storageKey = typeof key === 'string' ? key : StorageKeys[key];
      const value = await this.getItem(storageKey);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Failed to retrieve from storage:', error);
      return null;
    }
  }

  async remove(key: StorageKey): Promise<boolean> {
    try {
      const storageKey = typeof key === 'string' ? key : StorageKeys[key];
      await this.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to remove from storage:', error);
      return false;
    }
  }

  async clearAll(preserveKeys: string[] = []): Promise<boolean> {
    try {
      if (preserveKeys.length > 0) {
        // Save values that need to be preserved
        const preserved: Record<string, string | null> = {};
        
        for (const key of preserveKeys) {
          preserved[key] = await this.getItem(key);
        }
        
        // Clear storage
        await this.clear();
        
        // Restore preserved values
        for (const [key, value] of Object.entries(preserved)) {
          if (value !== null) {
            await this.setItem(key, value);
          }
        }
      } else {
        await this.clear();
      }
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  // Check if storage is available
  async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__storage_test__';
      await this.setItem(testKey, 'test');
      await this.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const storageService = new StorageService();
export default storageService;