import { useWallet } from '@/src/core/wallet/wallet-context';
import React from 'react';
import Box from '../general/Box';
import CustomText from '../general/CustomText';

/**
 * Debug component to show authentication status
 * Only visible in development mode
 */
export default function AuthStatusDebug() {
  const { 
    isWalletAuthenticated, 
    currentWalletUser, 
    isExchangeAuthenticated,
    currentExchangeUser,
    isConnected,
    lastUpdate 
  } = useWallet();

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <Box 
      backgroundColor="borderColor" 
      borderRadius={8} 
      p="m" 
      mb="m"
      borderWidth={1}
      borderColor="primaryColor"
    >
      <CustomText variant="xs" color="primaryColor" mb="s">
        🔧 Debug: Authentication Status
      </CustomText>
      
      <CustomText variant="xs" color="disabledTextColor">
        Wallet Auth: {isWalletAuthenticated ? '✅' : '❌'}
      </CustomText>
      
      <CustomText variant="xs" color="disabledTextColor">
        Wallet User: {currentWalletUser || 'None'}
      </CustomText>
      
      <CustomText variant="xs" color="disabledTextColor">
        Exchange Auth: {isExchangeAuthenticated ? '✅' : '❌'}
      </CustomText>
      
      <CustomText variant="xs" color="disabledTextColor">
        Exchange User: {currentExchangeUser || 'None'}
      </CustomText>
      
      <CustomText variant="xs" color="disabledTextColor">
        Connected: {isConnected ? '✅' : '❌'}
      </CustomText>
      
      <CustomText variant="xs" color="disabledTextColor">
        Last Update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
      </CustomText>
    </Box>
  );
}
