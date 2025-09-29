// utils/network-utils.ts
/**
 * Network Utilities
 * 
 * Provides React Native compatible network detection and utilities
 * 
 * Features:
 * - Cross-platform network status detection
 * - Offline/online state management
 * - Network type detection
 * - Connection quality monitoring
 * 
 * @example
 * ```typescript
 * const isOnline = await isNetworkAvailable();
 * const networkType = await getNetworkType();
 * ```
 */

export interface NetworkInfo {
  isConnected: boolean;
  type: NetworkType;
  isInternetReachable: boolean;
  details?: {
    strength?: number;
    ssid?: string;
    isConnectionExpensive?: boolean;
  };
}

export enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  BLUETOOTH = 'bluetooth',
  VPN = 'vpn',
  WIMAX = 'wimax',
  NONE = 'none',
  UNKNOWN = 'unknown'
}

/**
 * Check if network is available (React Native compatible)
 * @returns Promise<boolean> - True if network is available
 */
export const isNetworkAvailable = async (): Promise<boolean> => {
  try {
    // Try to use @react-native-community/netinfo if available
    if (typeof require !== 'undefined') {
      try {
        const NetInfo = require('@react-native-community/netinfo');
        const state = await NetInfo.fetch();
        return state.isConnected === true && state.isInternetReachable === true;
      } catch {
        // NetInfo not available, fallback to other methods
      }
    }

    // Browser environment fallback
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }

    // Default fallback - assume online
    return true;
  } catch (error) {
    console.warn('Failed to check network status:', error);
    return true; // Assume online on error
  }
};

/**
 * Get detailed network information
 * @returns Promise<NetworkInfo> - Network information
 */
export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  try {
    // Try to use @react-native-community/netinfo if available
    if (typeof require !== 'undefined') {
      try {
        const NetInfo = require('@react-native-community/netinfo');
        const state = await NetInfo.fetch();
        
        return {
          isConnected: state.isConnected === true,
          type: mapNetInfoType(state.type),
          isInternetReachable: state.isInternetReachable === true,
          details: {
            strength: state.details?.strength,
            ssid: state.details?.ssid,
            isConnectionExpensive: state.details?.isConnectionExpensive
          }
        };
      } catch {
        // NetInfo not available, fallback to basic detection
      }
    }

    // Browser environment fallback
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return {
        isConnected: navigator.onLine,
        type: NetworkType.UNKNOWN,
        isInternetReachable: navigator.onLine
      };
    }

    // Default fallback
    return {
      isConnected: true,
      type: NetworkType.UNKNOWN,
      isInternetReachable: true
    };
  } catch (error) {
    console.warn('Failed to get network info:', error);
    return {
      isConnected: true,
      type: NetworkType.UNKNOWN,
      isInternetReachable: true
    };
  }
};

/**
 * Map NetInfo type to our NetworkType enum
 * @param netInfoType - NetInfo type string
 * @returns NetworkType - Mapped network type
 */
const mapNetInfoType = (netInfoType: string): NetworkType => {
  switch (netInfoType) {
    case 'wifi':
      return NetworkType.WIFI;
    case 'cellular':
      return NetworkType.CELLULAR;
    case 'ethernet':
      return NetworkType.ETHERNET;
    case 'bluetooth':
      return NetworkType.BLUETOOTH;
    case 'vpn':
      return NetworkType.VPN;
    case 'wimax':
      return NetworkType.WIMAX;
    case 'none':
      return NetworkType.NONE;
    default:
      return NetworkType.UNKNOWN;
  }
};

/**
 * Check if the current connection is expensive (mobile data)
 * @returns Promise<boolean> - True if connection is expensive
 */
export const isConnectionExpensive = async (): Promise<boolean> => {
  try {
    const networkInfo = await getNetworkInfo();
    return networkInfo.details?.isConnectionExpensive === true;
  } catch (error) {
    console.warn('Failed to check connection cost:', error);
    return false;
  }
};

/**
 * Get network strength (if available)
 * @returns Promise<number | null> - Network strength (0-100) or null
 */
export const getNetworkStrength = async (): Promise<number | null> => {
  try {
    const networkInfo = await getNetworkInfo();
    return networkInfo.details?.strength || null;
  } catch (error) {
    console.warn('Failed to get network strength:', error);
    return null;
  }
};

/**
 * Check if connected to WiFi
 * @returns Promise<boolean> - True if connected to WiFi
 */
export const isWifiConnected = async (): Promise<boolean> => {
  try {
    const networkInfo = await getNetworkInfo();
    return networkInfo.type === NetworkType.WIFI && networkInfo.isConnected;
  } catch (error) {
    console.warn('Failed to check WiFi connection:', error);
    return false;
  }
};

/**
 * Check if connected to cellular network
 * @returns Promise<boolean> - True if connected to cellular
 */
export const isCellularConnected = async (): Promise<boolean> => {
  try {
    const networkInfo = await getNetworkInfo();
    return networkInfo.type === NetworkType.CELLULAR && networkInfo.isConnected;
  } catch (error) {
    console.warn('Failed to check cellular connection:', error);
    return false;
  }
};

/**
 * Network status change listener
 * @param callback - Callback function for network changes
 * @returns Function - Unsubscribe function
 */
export const addNetworkListener = (callback: (networkInfo: NetworkInfo) => void): (() => void) => {
  try {
    // Try to use @react-native-community/netinfo if available
    if (typeof require !== 'undefined') {
      try {
        const NetInfo = require('@react-native-community/netinfo');
        const unsubscribe = NetInfo.addEventListener((state: any) => {
          const networkInfo: NetworkInfo = {
            isConnected: state.isConnected === true,
            type: mapNetInfoType(state.type),
            isInternetReachable: state.isInternetReachable === true,
            details: {
              strength: state.details?.strength,
              ssid: state.details?.ssid,
              isConnectionExpensive: state.details?.isConnectionExpensive
            }
          };
          callback(networkInfo);
        });
        return unsubscribe;
      } catch {
        // NetInfo not available, fallback to browser events
      }
    }

    // Browser environment fallback
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      const handleOnline = () => {
        callback({
          isConnected: true,
          type: NetworkType.UNKNOWN,
          isInternetReachable: true
        });
      };

      const handleOffline = () => {
        callback({
          isConnected: false,
          type: NetworkType.NONE,
          isInternetReachable: false
        });
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // No-op fallback
    return () => {};
  } catch (error) {
    console.warn('Failed to add network listener:', error);
    return () => {};
  }
};