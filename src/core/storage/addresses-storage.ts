import * as SecureStore from 'expo-secure-store';

export interface StoredAddress {
  chainId: number;
  chainSymbol: string;
  chainName: string;
  address: string;
  logoUrl?: string;
  isEVM: boolean;
  timestamp: number;
}

class AddressesStorage {
  private static readonly ADDRESSES_PREFIX = 'addresses_';

  /**
   * Store addresses for a wallet
   */
  static async storeAddresses(userWalletGroupId: string, addresses: StoredAddress[]): Promise<void> {
    try {
      const key = `${this.ADDRESSES_PREFIX}${userWalletGroupId}`;
      const data = JSON.stringify(addresses);
      await SecureStore.setItemAsync(key, data);
      console.log(`✅ Stored ${addresses.length} addresses for wallet ${userWalletGroupId}`);
    } catch (error) {
      console.error('❌ Failed to store addresses:', error);
      throw error;
    }
  }

  /**
   * Retrieve addresses for a wallet
   */
  static async getAddresses(userWalletGroupId: string): Promise<StoredAddress[] | null> {
    try {
      const key = `${this.ADDRESSES_PREFIX}${userWalletGroupId}`;
      const data = await SecureStore.getItemAsync(key);
      
      if (!data) {
        console.log(`ℹ️ No addresses found for wallet ${userWalletGroupId}`);
        return null;
      }

      const addresses = JSON.parse(data) as StoredAddress[];
      console.log(`✅ Retrieved ${addresses.length} addresses for wallet ${userWalletGroupId}`);
      return addresses;
    } catch (error) {
      console.error('❌ Failed to retrieve addresses:', error);
      return null;
    }
  }

  /**
   * Check if addresses exist for a wallet
   */
  static async hasAddresses(userWalletGroupId: string): Promise<boolean> {
    try {
      const key = `${this.ADDRESSES_PREFIX}${userWalletGroupId}`;
      const data = await SecureStore.getItemAsync(key);
      return data !== null;
    } catch (error) {
      console.error('❌ Failed to check addresses existence:', error);
      return false;
    }
  }

  /**
   * Clear addresses for a wallet
   */
  static async clearAddresses(userWalletGroupId: string): Promise<void> {
    try {
      const key = `${this.ADDRESSES_PREFIX}${userWalletGroupId}`;
      await SecureStore.deleteItemAsync(key);
      console.log(`✅ Cleared addresses for wallet ${userWalletGroupId}`);
    } catch (error) {
      console.error('❌ Failed to clear addresses:', error);
      throw error;
    }
  }

  /**
   * Get address for a specific chain
   */
  static async getAddressForChain(
    userWalletGroupId: string, 
    chainId: number
  ): Promise<StoredAddress | null> {
    try {
      const addresses = await this.getAddresses(userWalletGroupId);
      if (!addresses) return null;

      return addresses.find(addr => addr.chainId === chainId) || null;
    } catch (error) {
      console.error('❌ Failed to get address for chain:', error);
      return null;
    }
  }
}

export default AddressesStorage;
