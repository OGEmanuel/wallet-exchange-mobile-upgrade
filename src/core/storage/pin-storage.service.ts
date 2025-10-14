import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

export interface PinData {
  hashedPin: string;
  createdAt: string;
}

class PinStorageService {
  private readonly PIN_KEY = 'wallet_pin_data';
  private readonly SALT = 'zap_wallet_pin_salt_2024';

  /**
   * Store PIN securely with hashing
   */
  async storePin(pin: string): Promise<boolean> {
    try {
      const hashedPin = this.hashPin(pin);
      const pinData: PinData = {
        hashedPin,
        createdAt: new Date().toISOString(),
      };

      await SecureStore.setItemAsync(this.PIN_KEY, JSON.stringify(pinData));
      return true;
    } catch (error) {
      console.error('❌ Failed to store PIN:', error);
      return false;
    }
  }

  /**
   * Verify PIN against stored hash
   */
  async verifyPin(enteredPin: string): Promise<boolean> {
    try {
      const storedData = await SecureStore.getItemAsync(this.PIN_KEY);
      if (!storedData) {
        return false;
      }

      const pinData: PinData = JSON.parse(storedData);
      const hashedEnteredPin = this.hashPin(enteredPin);
      
      return hashedEnteredPin === pinData.hashedPin;
    } catch (error) {
      console.error('❌ Failed to verify PIN:', error);
      return false;
    }
  }

  /**
   * Check if PIN exists
   */
  async hasPin(): Promise<boolean> {
    try {
      const storedData = await SecureStore.getItemAsync(this.PIN_KEY);
      return !!storedData;
    } catch (error) {
      console.error('❌ Failed to check PIN existence:', error);
      return false;
    }
  }

  /**
   * Get PIN creation date
   */
  async getPinCreatedAt(): Promise<string | null> {
    try {
      const storedData = await SecureStore.getItemAsync(this.PIN_KEY);
      if (!storedData) {
        return null;
      }

      const pinData: PinData = JSON.parse(storedData);
      return pinData.createdAt;
    } catch (error) {
      console.error('❌ Failed to get PIN creation date:', error);
      return null;
    }
  }

  /**
   * Delete PIN (for logout/reset)
   */
  async deletePin(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(this.PIN_KEY);
      console.log('✅ PIN deleted');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete PIN:', error);
      return false;
    }
  }

  /**
   * Hash PIN with salt
   */
  private hashPin(pin: string): string {
    try {
      return CryptoJS.SHA256(pin + this.SALT).toString();
    } catch (error) {
      console.error('❌ Failed to hash PIN:', error);
      // Fallback to simple hash if crypto-js fails
      return btoa(pin + this.SALT);
    }
  }
}

export const pinStorageService = new PinStorageService();
