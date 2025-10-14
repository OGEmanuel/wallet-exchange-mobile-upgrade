import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOnline: boolean;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: null,
    type: null,
    isOnline: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable === true;
      
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOnline,
      });
      
      setIsLoading(false);
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      const isOnline = state.isConnected && state.isInternetReachable === true;
      
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOnline,
      });
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    ...networkStatus,
    isLoading,
  };
};

export default useNetworkStatus;
