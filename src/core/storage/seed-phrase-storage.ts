import * as SecureStore from 'expo-secure-store';

export interface StoredSeedPhrase {
  userWalletGroupId: string;
  seedPhrase: string;
  timestamp: number;
  derivationIndex?: number;
}

class SeedPhraseStorage {
  private static readonly SEED_PHRASE_PREFIX = 'seed_phrase_';

  /**
   * Store seed phrase for a wallet group
   */
  static async storeSeedPhrase(
    userWalletGroupId: string,
    seedPhrase: string,
    derivationIndex?: number
  ): Promise<void> {
    try {
      const key = `${this.SEED_PHRASE_PREFIX}${userWalletGroupId}`;
      const data: StoredSeedPhrase = {
        userWalletGroupId,
        seedPhrase,
        timestamp: Date.now(),
        derivationIndex,
      };

      await SecureStore.setItemAsync(key, JSON.stringify(data));
      console.log(`✅ Stored seed phrase for wallet ${userWalletGroupId}`);
    } catch (error) {
      console.error('❌ Failed to store seed phrase:', error);
      throw error;
    }
  }

  /**
   * Get seed phrase for a wallet group
   */
  static async getSeedPhrase(userWalletGroupId: string): Promise<StoredSeedPhrase | null> {
    try {
      const key = `${this.SEED_PHRASE_PREFIX}${userWalletGroupId}`;
      const data = await SecureStore.getItemAsync(key);
      
      if (!data) {
        return null;
      }

      return JSON.parse(data) as StoredSeedPhrase;
    } catch (error) {
      console.error('❌ Failed to get seed phrase:', error);
      return null;
    }
  }

  /**
   * Get all stored seed phrases
   */
  static async getAllSeedPhrases(): Promise<StoredSeedPhrase[]> {
    try {
      // Since SecureStore doesn't have getAllKeys, we'll need to track this differently
      // For now, we'll return an empty array and implement this when needed
      console.warn('getAllSeedPhrases not implemented - SecureStore limitation');
      return [];
    } catch (error) {
      console.error('❌ Failed to get all seed phrases:', error);
      return [];
    }
  }

  /**
   * Clear seed phrase for a specific wallet group
   */
  static async clearSeedPhrase(userWalletGroupId: string): Promise<void> {
    try {
      const key = `${this.SEED_PHRASE_PREFIX}${userWalletGroupId}`;
      await SecureStore.deleteItemAsync(key);
      console.log(`✅ Cleared seed phrase for wallet ${userWalletGroupId}`);
    } catch (error) {
      console.error('❌ Failed to clear seed phrase:', error);
      throw error;
    }
  }

  /**
   * Clear all seed phrases
   */
  static async clearAllSeedPhrases(): Promise<void> {
    try {
      // Since we can't get all keys, we'll need to track this differently
      // For now, we'll implement this when needed
      console.warn('clearAllSeedPhrases not implemented - SecureStore limitation');
    } catch (error) {
      console.error('❌ Failed to clear all seed phrases:', error);
      throw error;
    }
  }
}

export default SeedPhraseStorage;
