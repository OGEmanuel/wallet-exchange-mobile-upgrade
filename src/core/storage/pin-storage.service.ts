import CryptoJS from "crypto-js";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

export interface PinData {
  hashedPin: string;
  createdAt: string;
}

class PinStorageService {
  private readonly PIN_KEY = "wallet_pin_data";
  private readonly SALT = "zap_wallet_pin_salt_2024";
  private readonly FACE_ID_KEY = "face_id_key";

  // add functionality for storing faceid toggle
  async toggleFaceId() {
    const value = SecureStore.getItem(this.FACE_ID_KEY);
    if (!value) {
      SecureStore.setItem(this.FACE_ID_KEY, "true");
    }
    if (value === "true") {
      SecureStore.setItem(this.FACE_ID_KEY, "false");
    } else {
      SecureStore.setItem(this.FACE_ID_KEY, "true");
    }

    return SecureStore.getItem(this.FACE_ID_KEY) === "true" ? true : false;
  }

  getFaceIdValue() {
    return SecureStore.getItem(this.FACE_ID_KEY) === "true" ? true : false;
  }

  async triggerFaceId(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        console.warn("Biometric hardware not available");
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.warn("No biometrics enrolled (FaceID/TouchID)");
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock with FaceID",
        cancelLabel: "Cancel",
        fallbackLabel: "Enter Passcode",
        disableDeviceFallback: false,
      });

      return !!result.success;
    } catch (error) {
      console.error("FaceID authentication failed:", error);
      return false;
    }
  }

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
      console.error("❌ Failed to store PIN:", error);
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
      console.error("❌ Failed to verify PIN:", error);
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
      console.error("❌ Failed to check PIN existence:", error);
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
      console.error("❌ Failed to get PIN creation date:", error);
      return null;
    }
  }

  /**
   * Delete PIN (for logout/reset)
   */
  async deletePin(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(this.PIN_KEY);
      console.log("✅ PIN deleted");
      return true;
    } catch (error) {
      console.error("❌ Failed to delete PIN:", error);
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
      console.error("❌ Failed to hash PIN:", error);
      // Fallback to simple hash if crypto-js fails
      return btoa(pin + this.SALT);
    }
  }
}

export const pinStorageService = new PinStorageService();
