import { useWallet } from '@/src/core/wallet/wallet-context';
import React from 'react';
import Box from '../general/Box';
import CustomButton from '../general/CustomButton';
import CustomText from '../general/CustomText';

interface PortfolioErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onLogin?: () => void;
}

export default function PortfolioErrorState({ 
  error, 
  onRetry, 
  onLogin 
}: PortfolioErrorStateProps) {
  const { isWalletAuthenticated, currentWalletUser } = useWallet();
  
  const isAuthError = error?.includes('authenticated') || error?.includes('token') || error?.includes('auth');
  const isNetworkError = error?.includes('connection') || error?.includes('network');
  
  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="m">
      <Box 
        backgroundColor="mainBackgroundColor" 
        borderRadius={12} 
        p="l" 
        width="100%"
        alignItems="center"
      >
        {/* Error Icon */}
        <Box
          width={60}
          height={60}
          borderRadius={30}
          backgroundColor={isAuthError ? "error" : "pendingColor"}
          justifyContent="center"
          alignItems="center"
          mb="m"
        >
          <CustomText fontSize={24} color="white">
            {isAuthError ? "🔐" : isNetworkError ? "📡" : "⚠️"}
          </CustomText>
        </Box>

        {/* Error Title */}
        <CustomText 
          variant="subheader" 
          textAlign="center" 
          mb="s"
          color="headerTextColor"
        >
          {isAuthError ? "Authentication Required" : 
           isNetworkError ? "Connection Issue" : 
           "Portfolio Error"}
        </CustomText>

        {/* Error Message */}
        <CustomText 
          variant="body" 
          textAlign="center" 
          color="disabledTextColor"
          mb="l"
        >
          {isAuthError 
            ? "Please log in to view your portfolio and assets."
            : isNetworkError
            ? "Unable to connect to the server. Please check your internet connection."
            : error || "Something went wrong while loading your portfolio."
          }
        </CustomText>

        {/* Action Buttons */}
        <Box width="100%" gap="m">
          {isAuthError && !isWalletAuthenticated && onLogin && (
            <CustomButton
              onPress={onLogin}
              text="Log In"
              width="100%"
              height={50}
              variant="bodySubheader"
            />
          )}
          
          <CustomButton
            onPress={onRetry}
            text="Try Again"
            width="100%"
            height={50}
            variant="body"
          />
        </Box>

        {/* Debug Info (only in development) */}
        {__DEV__ && (
          <Box mt="l" p="m" backgroundColor="borderColor" borderRadius={8} width="100%">
            <CustomText variant="xs" color="disabledTextColor" mb="s">
              Debug Info:
            </CustomText>
            <CustomText variant="xs" color="disabledTextColor">
              Authenticated: {isWalletAuthenticated ? 'Yes' : 'No'}
            </CustomText>
            <CustomText variant="xs" color="disabledTextColor">
              User ID: {currentWalletUser || 'None'}
            </CustomText>
            <CustomText variant="xs" color="disabledTextColor">
              Error: {error}
            </CustomText>
          </Box>
        )}
      </Box>
    </Box>
  );
}
