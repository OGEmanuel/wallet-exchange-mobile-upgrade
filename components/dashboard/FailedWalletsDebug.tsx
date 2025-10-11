import WalletCredentialsStorage, { WalletCredential } from '@/src/core/storage/wallet-credentials-storage';
import React, { useEffect, useState } from 'react';
import Box from '../general/Box';
import CustomButton from '../general/CustomButton';
import CustomText from '../general/CustomText';

/**
 * Debug component to show failed wallets
 * Only visible in development mode
 */
export default function FailedWalletsDebug() {
  const [failedWallets, setFailedWallets] = useState<WalletCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFailedWallets();
  }, []);

  const loadFailedWallets = async () => {
    try {
      setIsLoading(true);
      const failed = await WalletCredentialsStorage.getFailedWallets();
      setFailedWallets(failed);
    } catch (error) {
      console.error('Failed to load failed wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFailedWallets = async () => {
    try {
      for (const wallet of failedWallets) {
        await WalletCredentialsStorage.deleteWalletCredentials(wallet.id);
      }
      await loadFailedWallets();
    } catch (error) {
      console.error('Failed to clear failed wallets:', error);
    }
  };

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  if (isLoading) {
    return (
      <Box backgroundColor="borderColor" borderRadius={8} p="m" mb="m">
        <CustomText variant="xs" color="disabledTextColor">
          Loading failed wallets...
        </CustomText>
      </Box>
    );
  }

  if (failedWallets.length === 0) {
    return (
      <Box backgroundColor="success" borderRadius={8} p="m" mb="m">
        <CustomText variant="xs" color="white">
          ✅ No failed wallets
        </CustomText>
      </Box>
    );
  }

  return (
    <Box backgroundColor="error" borderRadius={8} p="m" mb="m">
      <CustomText variant="xs" color="white" mb="s">
        ❌ Failed Wallets ({failedWallets.length})
      </CustomText>
      
      {failedWallets.map((wallet, index) => (
        <Box key={wallet.id} mb="s" p="s" backgroundColor="white" borderRadius={4}>
          <CustomText variant="xs" color="black" mb="s">
            {index + 1}. {wallet.name}
          </CustomText>
          <CustomText variant="xs" color="black" mb="s">
            Type: {wallet.class}
          </CustomText>
          <CustomText variant="xs" color="black" mb="s">
            Reason: {wallet.failureReason || 'Unknown'}
          </CustomText>
          <CustomText variant="xs" color="black" mb="s">
            Retries: {wallet.retryCount}/{WalletCredentialsStorage['MAX_RETRY_COUNT']}
          </CustomText>
        </Box>
      ))}
      
      <CustomButton
        onPress={clearFailedWallets}
        text="Clear Failed Wallets"
        width="100%"
        height={30}
        variant="body"
      />
    </Box>
  );
}
