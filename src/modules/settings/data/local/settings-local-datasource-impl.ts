import storageService from "@/src/core/storage/app-storage";
import { SettingsLocalDataSource } from "./settings-local-datasource";

export class SettingsLocalDataSourceImpl implements SettingsLocalDataSource {
  async setBiometricEnabled(
    key: string,
    value: "true" | "false"
  ): Promise<void> {
    try {
      await storageService.setItem(key, value);
    } catch (error) {
      console.error("Error setting biometric enabled:", error);
      throw error;
    }
  }

  async getBiometricEnabled(key: string): Promise<"true" | "false"> {
    try {
      const value = (await storageService.getItem(key)) as "true" | "false";
      return value || "false";
    } catch (error) {
      console.error("Error getting biometric enabled:", error);
      throw error;
    }
  }
  // Implement your local data source methods here
  // Example:
  // async getCachedData(key: string): Promise<unknown> {
  //   try {
  //     const data = await SecureStore.getItemAsync(key);
  //     return data ? JSON.parse(data) : null;
  //   } catch (error) {
  //     console.error('Error getting cached data:', error);
  //     return null;
  //   }
  // }

  // async setCachedData(key: string, data: unknown): Promise<void> {
  //   try {
  //     await SecureStore.setItemAsync(key, JSON.stringify(data));
  //   } catch (error) {
  //     console.error('Error setting cached data:', error);
  //     throw error;
  //   }
  // }

  // async clearCachedData(key: string): Promise<void> {
  //   try {
  //     await SecureStore.deleteItemAsync(key);
  //   } catch (error) {
  //     console.error('Error clearing cached data:', error);
  //     throw error;
  //   }
  // }
}
