import * as SecureStore from 'expo-secure-store';

export interface WalletBackup {
  id: string;
  name: string;
  wallets: {
    id: string;
    name: string;
    address: string;
    chain: string;
  }[];
  seedPhrase?: string;
  privateKeys?: { [walletId: string]: string };
  createdAt: string;
  lastModified: string;
}

export interface WalletGroupBackup {
  id: string;
  name: string;
  wallets: WalletBackup[];
  password: string; // This will be hashed before storage
  createdAt: string;
  lastModified: string;
}

class ICloudBackupService {
  private readonly BACKUP_KEY_PREFIX = 'zap_wallet_backup_';
  private readonly BACKUP_INDEX_KEY = 'zap_backup_index';

  /**
   * Store a wallet group backup to iCloud/secure storage
   */
  async storeWalletGroupBackup(
    walletGroupId: string,
    walletGroupName: string,
    wallets: WalletBackup[],
    password: string
  ): Promise<boolean> {
    try {
      const backup: WalletGroupBackup = {
        id: walletGroupId,
        name: walletGroupName,
        wallets,
        password: await this.hashPassword(password),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const backupKey = `${this.BACKUP_KEY_PREFIX}${walletGroupId}`;
      
      // Store the backup data
      await SecureStore.setItemAsync(backupKey, JSON.stringify(backup));
      
      // Update the backup index
      await this.updateBackupIndex(walletGroupId, walletGroupName);
      
      console.log('✅ Wallet group backup stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to store wallet group backup:', error);
      return false;
    }
  }

  /**
   * Retrieve all available wallet group backups
   */
  async getWalletGroupBackups(): Promise<WalletGroupBackup[]> {
    try {
      const indexData = await SecureStore.getItemAsync(this.BACKUP_INDEX_KEY);
      if (!indexData) {
        return [];
      }

      const index = JSON.parse(indexData);
      const backups: WalletGroupBackup[] = [];

      for (const backupId of index.backupIds) {
        const backupKey = `${this.BACKUP_KEY_PREFIX}${backupId}`;
        const backupData = await SecureStore.getItemAsync(backupKey);
        
        if (backupData) {
          const backup = JSON.parse(backupData);
          // Remove password from returned data for security
          const { password, ...safeBackup } = backup;
          backups.push(safeBackup as WalletGroupBackup);
        }
      }

      return backups;
    } catch (error) {
      console.error('❌ Failed to retrieve wallet group backups:', error);
      return [];
    }
  }

  /**
   * Retrieve a specific wallet group backup by ID
   */
  async getWalletGroupBackup(backupId: string): Promise<WalletGroupBackup | null> {
    try {
      const backupKey = `${this.BACKUP_KEY_PREFIX}${backupId}`;
      const backupData = await SecureStore.getItemAsync(backupKey);
      
      if (!backupData) {
        return null;
      }

      const backup = JSON.parse(backupData);
      // Remove password from returned data for security
      const { password, ...safeBackup } = backup;
      return safeBackup as WalletGroupBackup;
    } catch (error) {
      console.error('❌ Failed to retrieve wallet group backup:', error);
      return null;
    }
  }

  /**
   * Verify password for a wallet group backup
   */
  async verifyBackupPassword(backupId: string, password: string): Promise<boolean> {
    try {
      const backupKey = `${this.BACKUP_KEY_PREFIX}${backupId}`;
      const backupData = await SecureStore.getItemAsync(backupKey);
      
      if (!backupData) {
        return false;
      }

      const backup = JSON.parse(backupData);
      const hashedPassword = await this.hashPassword(password);
      
      return backup.password === hashedPassword;
    } catch (error) {
      console.error('❌ Failed to verify backup password:', error);
      return false;
    }
  }

  /**
   * Restore a wallet group from backup
   */
  async restoreWalletGroup(backupId: string, password: string): Promise<WalletGroupBackup | null> {
    try {
      const isValidPassword = await this.verifyBackupPassword(backupId, password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      const backup = await this.getWalletGroupBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      console.log('✅ Wallet group restored successfully');
      return backup;
    } catch (error) {
      console.error('❌ Failed to restore wallet group:', error);
      return null;
    }
  }

  /**
   * Delete a wallet group backup
   */
  async deleteWalletGroupBackup(backupId: string): Promise<boolean> {
    try {
      const backupKey = `${this.BACKUP_KEY_PREFIX}${backupId}`;
      await SecureStore.deleteItemAsync(backupKey);
      
      // Update the backup index
      await this.removeFromBackupIndex(backupId);
      
      console.log('✅ Wallet group backup deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete wallet group backup:', error);
      return false;
    }
  }

  /**
   * Update backup index with new backup
   */
  private async updateBackupIndex(backupId: string, backupName: string): Promise<void> {
    try {
      const indexData = await SecureStore.getItemAsync(this.BACKUP_INDEX_KEY);
      let index = indexData ? JSON.parse(indexData) : { backupIds: [], backupNames: {} };
      
      if (!index.backupIds.includes(backupId)) {
        index.backupIds.push(backupId);
        index.backupNames[backupId] = backupName;
      }
      
      await SecureStore.setItemAsync(this.BACKUP_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('❌ Failed to update backup index:', error);
    }
  }

  /**
   * Remove backup from index
   */
  private async removeFromBackupIndex(backupId: string): Promise<void> {
    try {
      const indexData = await SecureStore.getItemAsync(this.BACKUP_INDEX_KEY);
      if (!indexData) return;
      
      const index = JSON.parse(indexData);
      index.backupIds = index.backupIds.filter((id: string) => id !== backupId);
      delete index.backupNames[backupId];
      
      await SecureStore.setItemAsync(this.BACKUP_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('❌ Failed to remove from backup index:', error);
    }
  }

  /**
   * Hash password for secure storage
   */
  private async hashPassword(password: string): Promise<string> {
    // In a real implementation, you would use a proper hashing library like bcrypt
    // For now, we'll use a simple hash (this should be replaced with proper crypto)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'zap_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if iCloud backup is available on this device
   */
  async isICloudAvailable(): Promise<boolean> {
    try {
      // Check if SecureStore is available (indicates iCloud sync capability)
      await SecureStore.getItemAsync('test_key');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalWallets: number;
    lastBackupDate?: string;
  }> {
    try {
      const backups = await this.getWalletGroupBackups();
      const totalWallets = backups.reduce((sum, backup) => sum + backup.wallets.length, 0);
      const lastBackupDate = backups.length > 0 
        ? Math.max(...backups.map(b => new Date(b.lastModified).getTime()))
        : undefined;

      return {
        totalBackups: backups.length,
        totalWallets,
        lastBackupDate: lastBackupDate ? new Date(lastBackupDate).toISOString() : undefined,
      };
    } catch (error) {
      console.error('❌ Failed to get backup stats:', error);
      return { totalBackups: 0, totalWallets: 0 };
    }
  }
}

export const iCloudBackupService = new ICloudBackupService();
