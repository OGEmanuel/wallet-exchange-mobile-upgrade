import NetworkErrorModal from '@/components/Modals/NetworkErrorModal';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface NetworkContextType {
  isOnline: boolean;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isLoading: boolean;
  showNetworkError: (message?: string, onRetry?: () => void) => void;
  hideNetworkError: () => void;
  isNetworkErrorVisible: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const {
    isOnline,
    isConnected,
    isInternetReachable,
    type,
    isLoading,
  } = useNetworkStatus();

  const [isNetworkErrorVisible, setIsNetworkErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCallback, setRetryCallback] = useState<(() => void) | undefined>();

  const showNetworkError = useCallback((message?: string, onRetry?: () => void) => {
    setErrorMessage(message || 'Please check your internet connection and try again.');
    setRetryCallback(() => onRetry);
    setIsNetworkErrorVisible(true);
  }, []);

  const hideNetworkError = useCallback(() => {
    setIsNetworkErrorVisible(false);
    setErrorMessage('');
    setRetryCallback(undefined);
  }, []);

  const handleRetry = useCallback(() => {
    if (retryCallback) {
      retryCallback();
    }
    hideNetworkError();
  }, [retryCallback, hideNetworkError]);

  const contextValue: NetworkContextType = {
    isOnline,
    isConnected,
    isInternetReachable,
    type,
    isLoading,
    showNetworkError,
    hideNetworkError,
    isNetworkErrorVisible,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
      
      <NetworkErrorModal
        visible={isNetworkErrorVisible}
        onRetry={handleRetry}
        onClose={hideNetworkError}
        message={errorMessage}
        showRetryButton={!!retryCallback}
      />
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkProvider;
