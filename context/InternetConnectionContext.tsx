import InternetConnectionModal from '@/components/general/InternetConnectionModal';
import NetInfo from '@react-native-community/netinfo';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface InternetConnectionContextType {
  isConnected: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  retryConnection: () => void;
}

const InternetConnectionContext = createContext<InternetConnectionContextType | undefined>(undefined);

interface InternetConnectionProviderProps {
  children: ReactNode;
}

export function InternetConnectionProvider({ children }: InternetConnectionProviderProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // Show modal when connection is lost
      if (!connected && !hasShownModal) {
        setShowModal(true);
        setHasShownModal(true);
      }

      // Hide modal when connection is restored
      if (connected && showModal) {
        setShowModal(false);
        setHasShownModal(false);
      }
    });

    return () => unsubscribe();
  }, [showModal, hasShownModal]);

  const retryConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      const connected = state.isConnected ?? false;
      
      if (connected) {
        setShowModal(false);
        setHasShownModal(false);
        setIsConnected(true);
      } else {
        // Connection still not available, keep modal open
        console.log('Still no internet connection');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
  };

  const value: InternetConnectionContextType = {
    isConnected,
    showModal,
    setShowModal,
    retryConnection,
  };

  return (
    <InternetConnectionContext.Provider value={value}>
      {children}
      <InternetConnectionModal
        visible={showModal}
        onRetry={retryConnection}
        onDismiss={handleDismiss}
      />
    </InternetConnectionContext.Provider>
  );
}

export function useInternetConnection() {
  const context = useContext(InternetConnectionContext);
  if (context === undefined) {
    throw new Error('useInternetConnection must be used within an InternetConnectionProvider');
  }
  return context;
}
