/**
 * Wallet Credentials Storage
 * 
 * Secure storage for wallet credentials (seed phrases, private keys, watch addresses)
 * that cannot be stored on the backend for security reasons.
 */

import { WALLET_GROUP_CLASS } from '@zap/blockchain-sdk';
import * as SecureStore from 'expo-secure-store';

export interface WalletCredential {
  id: string;
  userWalletGroupId?: string; // Set after successful SDK creation
  name: string;
  class: WALLET_GROUP_CLASS;
  credential: string; // seed phrase, private key, or watch address
  chain?: string;
  createdAt: string;
  lastAttempted?: string;
  derivationIndex?: number;
  isCreated: boolean; // Whether successfully created in SDK
  areAccountsCreated: boolean;
  retryCount: number;
  isFailed?: boolean; // Whether wallet creation permanently failed
  failureReason?: string; // Reason for permanent failure
}

export interface StoredWalletCredentials {
  [walletId: string]: WalletCredential;
}

class WalletCredentialsStorage {
  private static readonly STORAGE_KEY = 'wallet_credentials';
  private static readonly MAX_RETRY_COUNT = 3;

  /**
   * Store wallet credentials securely
   */
  static async storeWalletCredential(credential: Omit<WalletCredential, 'id' | 'createdAt' | 'isCreated' | 'retryCount' | 'areAccountsCreated'>): Promise<string> {
    try {
      const walletStorageId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const fullCredential: WalletCredential = {
        id: walletStorageId,
        createdAt: new Date().toISOString(),
        isCreated: false,
        areAccountsCreated: false,
        retryCount: 0,
        ...credential,
      };

      const existingCredentials = await this.getAllCredentials();
      existingCredentials[walletStorageId] = fullCredential;

      await SecureStore.setItemAsync(
        this.STORAGE_KEY,
        JSON.stringify(existingCredentials)
      );

      console.log('✅ Wallet credentials stored securely:', walletStorageId);
      return walletStorageId;
    } catch (error) {
      console.error('Failed to store wallet credentials:', error);
      throw new Error('Failed to store wallet credentials');
    }
  }

  /**
   * Get all stored wallet credentials
   */
  static async getAllCredentials(): Promise<StoredWalletCredentials> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get wallet credentials:', error);
      return {};
    }
  }

  /**
   * Get credentials for a specific wallet
   */
  static async getWalletCredentials(walletStorageId: string): Promise<WalletCredential | null> {
    try {
      const allCredentials = await this.getAllCredentials();
      return allCredentials[walletStorageId] || null;
    } catch (error) {
      console.error('Failed to get wallet credentials:', error);
      return null;
    }
  }

  static async getWalletStorageIdByUserWalletGroupId(userWalletGroupId: string): Promise<string | null> {
    try {
      const allCredentials = await this.getAllCredentials();
      return Object.values(allCredentials).find(
        (wallet: WalletCredential) => wallet.userWalletGroupId === userWalletGroupId
      )?.id || null;
    } catch (error) {
      console.error('Failed to get wallet storage ID by user wallet group ID:', error);
      return null;
    }
  }

  static async getCredentialsByUserWalletGroupId(userWalletGroupId: string): Promise<WalletCredential | null> {
    try {
      const allCredentials = await this.getAllCredentials();
      console.log('🔍 All credentials:', allCredentials);
      return Object.values(allCredentials).find(
        (wallet: WalletCredential) => wallet.userWalletGroupId === userWalletGroupId
      ) || null;
    } catch (error) {
      console.error('Failed to get wallet credentials by wallet group ID:', error);
      return null;
    }
  }

  /**
   * Update wallet credentials (e.g., mark as created, update walletGroupId)
   */
  static async updateWalletCredentials(
    walletStorageId: string,
    updates: Partial<WalletCredential>
  ): Promise<void> {
    try {
      const allCredentials = await this.getAllCredentials();

      if (allCredentials[walletStorageId]) {
        allCredentials[walletStorageId] = {
          ...allCredentials[walletStorageId],
          ...updates,
        };

        await SecureStore.setItemAsync(
          this.STORAGE_KEY,
          JSON.stringify(allCredentials)
        );

        console.log('✅ Wallet credentials updated:', walletStorageId);
      }
    } catch (error) {
      console.error('Failed to update wallet credentials:', error);
      throw new Error('Failed to update wallet credentials');
    }
  }
  static async updateWalletCredentialsByUserWalletGroupId(userWalletGroupId: string, updates: Partial<WalletCredential>): Promise<void> {
    try {
      const allCredentials = await this.getAllCredentials();
      Object.values(allCredentials).forEach(wallet => {
        if (wallet.userWalletGroupId === userWalletGroupId) {
          this.updateWalletCredentials(wallet.id, updates);
        }
      });
    } catch (error) {
      console.error('Failed to update wallet credentials by user wallet group ID:', error);
      throw new Error('Failed to update wallet credentials by user wallet group ID');
    }
  }

  /**
   * Mark wallet as successfully created in SDK
   */
  static async markWalletAsCreated(walletStorageId: string, userWalletGroupId: string): Promise<void> {
    await this.updateWalletCredentials(walletStorageId, {
      userWalletGroupId,
      isCreated: true,
      retryCount: 0,
    });
  }

  static async markWalletAsAccountsCreated(walletStorageId: string, userWalletGroupId: string): Promise<void> {
    await this.updateWalletCredentials(walletStorageId, {
      userWalletGroupId,
      areAccountsCreated: true,
    });
  }

  /**
   * Mark wallet as permanently failed (validation errors, auth errors, etc.)
   */
  static async markWalletAsFailed(walletStorageId: string, failureReason: string): Promise<void> {
    await this.updateWalletCredentials(walletStorageId, {
      isFailed: true,
      failureReason,
      retryCount: this.MAX_RETRY_COUNT, // Set to max to prevent further retries
    });
  }

  /**
   * Mark wallet creation attempt (for retry logic)
   */
  static async markWalletCreationAttempt(walletStorageId: string, success: boolean): Promise<void> {
    const credentials = await this.getWalletCredentials(walletStorageId);
    if (credentials) {
      await this.updateWalletCredentials(walletStorageId, {
        lastAttempted: new Date().toISOString(),
        retryCount: success ? 0 : credentials.retryCount + 1,
        isCreated: success,
      });
    }
  }

  /**
   * Get wallets that need to be created in SDK (failed or not attempted)
   */
  static async getPendingWallets(): Promise<WalletCredential[]> {
    try {
      const allCredentials = await this.getAllCredentials();
      return Object.values(allCredentials).filter(
        wallet => !wallet.isCreated &&
          wallet.retryCount < this.MAX_RETRY_COUNT &&
          !wallet.isFailed
      );
    } catch (error) {
      console.error('Failed to get pending wallets:', error);
      return [];
    }
  }

  static async getAccountsPendingWallets(): Promise<WalletCredential[]> {
    try {
      const allCredentials = await this.getAllCredentials();
      return Object.values(allCredentials).filter(
        wallet => wallet.isCreated &&
          !wallet.areAccountsCreated &&
          wallet.retryCount < this.MAX_RETRY_COUNT &&
          !wallet.isFailed
      );
    } catch (error) {
      console.error('Failed to get accounts pending wallets:', error);
      return [];
    }
  }

  /**
   * Delete wallet credentials
   */
  static async deleteWalletCredentials(walletStorageId: string): Promise<void> {
    try {
      const allCredentials = await this.getAllCredentials();
      delete allCredentials[walletStorageId];

      await SecureStore.setItemAsync(
        this.STORAGE_KEY,
        JSON.stringify(allCredentials)
      );

      console.log('✅ Wallet credentials deleted:', walletStorageId);
    } catch (error) {
      console.error('Failed to delete wallet credentials:', error);
      throw new Error('Failed to delete wallet credentials');
    }
  }

  static async deleteCredentialsByUserWalletGroupId(userWalletGroupId: string): Promise<void> {
    try {
      const allCredentials = await this.getAllCredentials();
      Object.values(allCredentials).forEach(wallet => {
        if (wallet.userWalletGroupId === userWalletGroupId) {
          this.deleteWalletCredentials(wallet.id);
        }
      });
    }
    catch (error) {
      console.error('Failed to delete wallet credentials by user wallet group ID:', error);
      throw new Error('Failed to delete wallet credentials by user wallet group ID');
    }
  }


  /**
   * Clear all wallet credentials (for logout)
   */
  static async clearAllCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.STORAGE_KEY);
      console.log('✅ All wallet credentials cleared');
    } catch (error) {
      console.error('Failed to clear wallet credentials:', error);
    }
  }

  /**
   * Get wallet credentials for retry (those that failed but haven't exceeded retry limit)
   */
  static async getRetryableWallets(): Promise<WalletCredential[]> {
    try {
      const allCredentials = await this.getAllCredentials();
      return Object.values(allCredentials).filter(
        wallet => !wallet.isCreated &&
          wallet.retryCount < this.MAX_RETRY_COUNT &&
          wallet.retryCount > 0 &&
          !wallet.isFailed
      );
    } catch (error) {
      console.error('Failed to get retryable wallets:', error);
      return [];
    }
  }

  /**
   * Get wallets that have permanently failed
   */
  static async getFailedWallets(): Promise<WalletCredential[]> {
    try {
      const allCredentials = await this.getAllCredentials();
      return Object.values(allCredentials).filter(
        wallet => wallet.isFailed
      );
    } catch (error) {
      console.error('Failed to get failed wallets:', error);
      return [];
    }
  }
}

export default WalletCredentialsStorage;
