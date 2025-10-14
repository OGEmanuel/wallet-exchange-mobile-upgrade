import * as SecureStore from 'expo-secure-store';

export interface StoredPrivateKey {
  chainId: number;
  chainSymbol: string;
  chainName: string;
  privateKey: string;
  logoUrl?: string;
  isEVM: boolean;
  timestamp: number;
}

class PrivateKeysStorage {
  private static readonly PRIVATE_KEYS_PREFIX = 'private_keys_';

  /**
   * Store private keys for a wallet
   */
  static async storePrivateKeys(userWalletGroupId: string, privateKeys: StoredPrivateKey[]): Promise<void> {
    try {
      const key = `${this.PRIVATE_KEYS_PREFIX}${userWalletGroupId}`;
      const data = JSON.stringify(privateKeys);
      await SecureStore.setItemAsync(key, data);
      console.log(`✅ Stored ${privateKeys.length} private keys for wallet ${userWalletGroupId}`);
    } catch (error) {
      console.error('❌ Failed to store private keys:', error);
      throw error;
    }
  }

  /**
   * Retrieve private keys for a wallet
   */
  static async getPrivateKeys(userWalletGroupId: string): Promise<StoredPrivateKey[] | null> {
    try {
      const key = `${this.PRIVATE_KEYS_PREFIX}${userWalletGroupId}`;
      const data = await SecureStore.getItemAsync(key);
      
      if (!data) {
        console.log(`ℹ️ No private keys found for wallet ${userWalletGroupId}`);
        return null;
      }

      const privateKeys = JSON.parse(data) as StoredPrivateKey[];
      console.log(`✅ Retrieved ${privateKeys.length} private keys for wallet ${userWalletGroupId}`);
      return privateKeys;
    } catch (error) {
      console.error('❌ Failed to retrieve private keys:', error);
      return null;
    }
  }

  /**
   * Check if private keys exist for a wallet
   */
  static async hasPrivateKeys(userWalletGroupId: string): Promise<boolean> {
    try {
      const key = `${this.PRIVATE_KEYS_PREFIX}${userWalletGroupId}`;
      const data = await SecureStore.getItemAsync(key);
      return data !== null;
    } catch (error) {
      console.error('❌ Failed to check private keys existence:', error);
      return false;
    }
  }

  /**
   * Clear private keys for a wallet
   */
  static async clearPrivateKeys(userWalletGroupId: string): Promise<void> {
    try {
      const key = `${this.PRIVATE_KEYS_PREFIX}${userWalletGroupId}`;
      await SecureStore.deleteItemAsync(key);
      console.log(`✅ Cleared private keys for wallet ${userWalletGroupId}`);
    } catch (error) {
      console.error('❌ Failed to clear private keys:', error);
      throw error;
    }
  }

  /**
   * Get private key for a specific chain
   */
  static async getPrivateKeyForChain(
    userWalletGroupId: string, 
    chainId: number
  ): Promise<StoredPrivateKey | null> {
    try {
      const privateKeys = await this.getPrivateKeys(userWalletGroupId);
      if (!privateKeys) return null;

      return privateKeys.find(pk => pk.chainId === chainId) || null;
    } catch (error) {
      console.error('❌ Failed to get private key for chain:', error);
      return null;
    }
  }
}

export default PrivateKeysStorage;
