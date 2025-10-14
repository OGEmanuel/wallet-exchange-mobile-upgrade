import { iCloudBackupService, WalletBackup, WalletGroupBackup } from '../storage/icloud-backup.service';

/**
 * Create a backup of a wallet group for iCloud storage
 */
export async function createWalletGroupBackup(
  walletGroupId: string,
  walletGroupName: string,
  wallets: {
    id: string;
    name: string;
    address: string;
    chain: string;
    seedPhrase?: string;
    privateKey?: string;
  }[],
  password: string
): Promise<boolean> {
  try {
    console.log(`📦 Creating backup for wallet group: ${walletGroupName}`);

    // Convert wallets to backup format
    const walletBackups: WalletBackup[] = wallets.map(wallet => ({
      id: wallet.id,
      name: wallet.name,
      address: wallet.address,
      chain: wallet.chain,
      seedPhrase: wallet.seedPhrase,
      privateKeys: wallet.privateKey ? { [wallet.id]: wallet.privateKey } : undefined,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      wallets: [wallet],
    }));

    // Store the backup
    const success = await iCloudBackupService.storeWalletGroupBackup(
      walletGroupId,
      walletGroupName,
      walletBackups,
      password
    );

    if (success) {
      console.log('✅ Wallet group backup created successfully');
    } else {
      console.error('❌ Failed to create wallet group backup');
    }

    return success;
  } catch (error) {
    console.error('❌ Error creating wallet group backup:', error);
    return false;
  }
}

/**
 * Restore wallets from a backup and integrate with SDK
 */
export async function restoreWalletsFromBackup(
  backupId: string,
  password: string
): Promise<{
  success: boolean;
  walletGroup?: WalletGroupBackup;
  error?: string;
}> {
  try {
    console.log(`🔄 Restoring wallets from backup: ${backupId}`);

    // Restore the wallet group
    const restoredGroup = await iCloudBackupService.restoreWalletGroup(backupId, password);

    if (!restoredGroup) {
      return {
        success: false,
        error: 'Invalid password or backup not found'
      };
    }

    console.log(`✅ Restored ${restoredGroup.wallets.length} wallets from backup`);

    return {
      success: true,
      walletGroup: restoredGroup
    };
  } catch (error) {
    console.error('❌ Error restoring wallets from backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get backup statistics for display
 */
export async function getBackupStatistics(): Promise<{
  totalBackups: number;
  totalWallets: number;
  lastBackupDate?: string;
  isICloudAvailable: boolean;
}> {
  try {
    const [stats, isICloudAvailable] = await Promise.all([
      iCloudBackupService.getBackupStats(),
      iCloudBackupService.isICloudAvailable()
    ]);

    return {
      ...stats,
      isICloudAvailable
    };
  } catch (error) {
    console.error('❌ Error getting backup statistics:', error);
    return {
      totalBackups: 0,
      totalWallets: 0,
      isICloudAvailable: false
    };
  }
}

/**
 * Delete a wallet group backup
 */
export async function deleteWalletGroupBackup(backupId: string): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting wallet group backup: ${backupId}`);

    const success = await iCloudBackupService.deleteWalletGroupBackup(backupId);

    if (success) {
      console.log('✅ Wallet group backup deleted successfully');
    } else {
      console.error('❌ Failed to delete wallet group backup');
    }

    return success;
  } catch (error) {
    console.error('❌ Error deleting wallet group backup:', error);
    return false;
  }
}

/**
 * List all available wallet group backups
 */
export async function listWalletGroupBackups(): Promise<WalletGroupBackup[]> {
  try {
    console.log('📋 Listing all wallet group backups');

    const backups = await iCloudBackupService.getWalletGroupBackups();

    console.log(`📦 Found ${backups.length} wallet group backups`);

    return backups;
  } catch (error) {
    console.error('❌ Error listing wallet group backups:', error);
    return [];
  }
}
