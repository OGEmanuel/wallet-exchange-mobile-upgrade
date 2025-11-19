/**
 * Hook for managing socket connection and event listeners
 * 
 * Provides a centralized way to manage socket connections and subscribe to
 * real-time events throughout the app using the Zap SDK.
 * 
 * @example
 * ```tsx
 * const { isConnected, subscribeToOrderStatus, unsubscribe } = useSocketConnection();
 * 
 * useEffect(() => {
 *   const unsubscribe = subscribeToOrderStatus((data) => {
 *     console.log('Order status update:', data);
 *   });
 *   
 *   return () => unsubscribe();
 * }, []);
 * ```
 */

import { ENVIRONMENTS } from "@/configs/environments";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { ExchangeSocketLibrary } from "@zap/blockchain-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface OrderStatusUpdateData {
  order?: {
    _id: string;
    status?: string;
    [key: string]: any;
  };
  transaction?: {
    _id: string;
    status?: string;
    [key: string]: any;
  };
  transactionId?: string;
  status?: string;
  [key: string]: any;
}

export interface UseSocketConnectionReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionState: SocketConnectionState;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  
  // Event subscription methods
  subscribeToOrderStatus: (
    callback: (data: OrderStatusUpdateData) => void
  ) => () => void;
  subscribeToWalletUpdate: (
    callback: (data: any) => void
  ) => () => void;
  subscribeToPortfolioUpdate: (
    callback: (data: any) => void
  ) => () => void;
  subscribeToConnectionChange: (
    callback: (connected: boolean) => void
  ) => () => void;
  subscribeToNotification: (
    callback: (notification: any) => void
  ) => () => void;
  
  // Utility methods
  getSDK: () => any;
}

/**
 * Hook for managing socket connection and event listeners
 */
export const useSocketConnection = (): UseSocketConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to store unsubscribe functions for each event type
  const orderStatusUnsubscribersRef = useRef<Set<() => void>>(new Set());
  const walletUpdateUnsubscribersRef = useRef<Set<() => void>>(new Set());
  const portfolioUpdateUnsubscribersRef = useRef<Set<() => void>>(new Set());
  const connectionChangeUnsubscribersRef = useRef<Set<() => void>>(new Set());
  const notificationUnsubscribersRef = useRef<Set<() => void>>(new Set());
  
  // Ref to track if we've initialized the connection
  const connectionInitializedRef = useRef(false);
  
  // ExchangeSocketLibrary instance for direct socket events
  const exchangeSocketLibRef = useRef<ExchangeSocketLibrary | null>(null);
  
  /**
   * Get SDK instance
   */
  const getSDK = useCallback(() => {
    try {
      return zapSDKService.getSDK();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SDK not initialized';
      console.error('[useSocketConnection] Failed to get SDK:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, []);
  
  /**
   * Connect to socket
   */
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const sdk = getSDK();
      if (!sdk) {
        throw new Error('SDK not available');
      }
      
      // Connect WebSocket if method exists
      if (typeof sdk.connectWebSocket === 'function') {
        await sdk.connectWebSocket();
      }
      
      setIsConnected(true);
      connectionInitializedRef.current = true;
      console.log('[useSocketConnection] Socket connected');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect socket';
      console.error('[useSocketConnection] Connection error:', errorMessage);
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, getSDK]);
  
  /**
   * Disconnect from socket
   */
  const disconnect = useCallback(async () => {
    try {
      const sdk = getSDK();
      if (sdk && typeof sdk.disconnectWebSocket === 'function') {
        await sdk.disconnectWebSocket();
      }
      
      // Clean up all event listeners
      orderStatusUnsubscribersRef.current.forEach(unsub => unsub());
      walletUpdateUnsubscribersRef.current.forEach(unsub => unsub());
      portfolioUpdateUnsubscribersRef.current.forEach(unsub => unsub());
      connectionChangeUnsubscribersRef.current.forEach(unsub => unsub());
      notificationUnsubscribersRef.current.forEach(unsub => unsub());
      
      orderStatusUnsubscribersRef.current.clear();
      walletUpdateUnsubscribersRef.current.clear();
      portfolioUpdateUnsubscribersRef.current.clear();
      connectionChangeUnsubscribersRef.current.clear();
      notificationUnsubscribersRef.current.clear();
      
      // Disconnect ExchangeSocketLibrary
      if (exchangeSocketLibRef.current) {
        try {
          exchangeSocketLibRef.current.disconnect();
        } catch (err) {
          console.warn('[useSocketConnection] Error disconnecting ExchangeSocketLibrary:', err);
        }
        exchangeSocketLibRef.current = null;
      }
      
      setIsConnected(false);
      connectionInitializedRef.current = false;
      console.log('[useSocketConnection] Socket disconnected');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect socket';
      console.error('[useSocketConnection] Disconnect error:', errorMessage);
      setError(errorMessage);
    }
  }, [getSDK]);
  
  /**
   * Reconnect to socket
   */
  const reconnect = useCallback(async () => {
    await disconnect();
    await connect();
  }, [disconnect, connect]);
  
  /**
   * Initialize ExchangeSocketLibrary connection
   */
  const initializeExchangeSocket = useCallback(async () => {
    if (exchangeSocketLibRef.current) {
      return exchangeSocketLibRef.current;
    }
    
    try {
      const sdk = getSDK();
      if (!sdk) {
        throw new Error('SDK not available');
      }
      
      const socketLib = new ExchangeSocketLibrary();
      const baseURL = ENVIRONMENTS.EXPO_PUBLIC_STAGING_BASE_URL ||
        process.env.EXPO_PUBLIC_API_BASE_URL ||
        "https://test-backend-2.zap.africa";
      
      const tokens = await sdk.exchangeAuth.getTokens();
      socketLib.connect(baseURL, tokens?.token);
      
      exchangeSocketLibRef.current = socketLib;
      console.log('[useSocketConnection] ExchangeSocketLibrary initialized');
      
      return socketLib;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize ExchangeSocketLibrary';
      console.error('[useSocketConnection] ExchangeSocketLibrary init error:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [getSDK]);
  
  /**
   * Subscribe to order status updates
   * Supports both SDK's onOrderStatusUpdate and ExchangeSocketLibrary's 'orderStatus' event
   */
  const subscribeToOrderStatus = useCallback((
    callback: (data: OrderStatusUpdateData) => void
  ): (() => void) => {
    const sdk = getSDK();
    if (!sdk) {
      console.warn('[useSocketConnection] Cannot subscribe to order status: SDK not available');
      return () => {}; // Return no-op unsubscribe function
    }
    
    const cleanupFunctions: (() => void)[] = [];
    
    try {
      // Subscribe using SDK's onOrderStatusUpdate method
      const sdkUnsubscribe = sdk.onOrderStatusUpdate((data: OrderStatusUpdateData) => {
        callback(data);
      });
      
      if (sdkUnsubscribe && typeof sdkUnsubscribe === 'function') {
        cleanupFunctions.push(sdkUnsubscribe);
      }
      
      // Also subscribe to ExchangeSocketLibrary 'orderStatus' event
      initializeExchangeSocket().then((socketLib) => {
        if (socketLib) {
          const handleOrderStatus = (data: OrderStatusUpdateData) => {
            // Normalize the data structure
            const normalizedData: OrderStatusUpdateData = {
              ...data,
              // Handle different event structures
              order: data.order || data.transaction || (data as any),
              status: data.status || data.order?.status || data.transaction?.status,
            };
            callback(normalizedData);
          };
          
          socketLib.on('orderStatus', handleOrderStatus);
          socketLib.on('statusUpdate', handleOrderStatus);
          
          cleanupFunctions.push(() => {
            socketLib.off('orderStatus', handleOrderStatus);
            socketLib.off('statusUpdate', handleOrderStatus);
          });
        }
      }).catch((err) => {
        console.warn('[useSocketConnection] Failed to setup ExchangeSocketLibrary listener:', err);
      });
      
      // Combined cleanup function
      const cleanup = () => {
        cleanupFunctions.forEach(fn => {
          try {
            fn();
          } catch (err) {
            console.warn('[useSocketConnection] Error during cleanup:', err);
          }
        });
        orderStatusUnsubscribersRef.current.delete(cleanup);
      };
      
      orderStatusUnsubscribersRef.current.add(cleanup);
      
      console.log('[useSocketConnection] Subscribed to order status updates (SDK + Socket)');
      
      return cleanup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to order status';
      console.error('[useSocketConnection] Subscription error:', errorMessage);
      setError(errorMessage);
      return () => {}; // Return no-op unsubscribe function
    }
  }, [getSDK, initializeExchangeSocket]);
  
  /**
   * Subscribe to wallet updates
   */
  const subscribeToWalletUpdate = useCallback((
    callback: (data: any) => void
  ): (() => void) => {
    const sdk = getSDK();
    if (!sdk) {
      console.warn('[useSocketConnection] Cannot subscribe to wallet updates: SDK not available');
      return () => {};
    }
    
    try {
      const unsubscribe = sdk.onWalletUpdate((data: any) => {
        callback(data);
      });
      
      const cleanup = () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
        walletUpdateUnsubscribersRef.current.delete(cleanup);
      };
      
      walletUpdateUnsubscribersRef.current.add(cleanup);
      
      console.log('[useSocketConnection] Subscribed to wallet updates');
      
      return cleanup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to wallet updates';
      console.error('[useSocketConnection] Subscription error:', errorMessage);
      setError(errorMessage);
      return () => {};
    }
  }, [getSDK]);
  
  /**
   * Subscribe to portfolio updates
   */
  const subscribeToPortfolioUpdate = useCallback((
    callback: (data: any) => void
  ): (() => void) => {
    const sdk = getSDK();
    if (!sdk) {
      console.warn('[useSocketConnection] Cannot subscribe to portfolio updates: SDK not available');
      return () => {};
    }
    
    try {
      const unsubscribe = sdk.onPortfolioUpdate((data: any) => {
        callback(data);
      });
      
      const cleanup = () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
        portfolioUpdateUnsubscribersRef.current.delete(cleanup);
      };
      
      portfolioUpdateUnsubscribersRef.current.add(cleanup);
      
      console.log('[useSocketConnection] Subscribed to portfolio updates');
      
      return cleanup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to portfolio updates';
      console.error('[useSocketConnection] Subscription error:', errorMessage);
      setError(errorMessage);
      return () => {};
    }
  }, [getSDK]);
  
  /**
   * Subscribe to connection changes
   */
  const subscribeToConnectionChange = useCallback((
    callback: (connected: boolean) => void
  ): (() => void) => {
    const sdk = getSDK();
    if (!sdk) {
      console.warn('[useSocketConnection] Cannot subscribe to connection changes: SDK not available');
      return () => {};
    }
    
    try {
      const unsubscribe = sdk.onConnectionChange((connected: boolean) => {
        setIsConnected(connected);
        callback(connected);
      });
      
      const cleanup = () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
        connectionChangeUnsubscribersRef.current.delete(cleanup);
      };
      
      connectionChangeUnsubscribersRef.current.add(cleanup);
      
      console.log('[useSocketConnection] Subscribed to connection changes');
      
      return cleanup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to connection changes';
      console.error('[useSocketConnection] Subscription error:', errorMessage);
      setError(errorMessage);
      return () => {};
    }
  }, [getSDK]);
  
  /**
   * Subscribe to notifications
   */
  const subscribeToNotification = useCallback((
    callback: (notification: any) => void
  ): (() => void) => {
    const sdk = getSDK();
    if (!sdk) {
      console.warn('[useSocketConnection] Cannot subscribe to notifications: SDK not available');
      return () => {};
    }
    
    try {
      const unsubscribe = sdk.onNotification((notification: any) => {
        callback(notification);
      });
      
      const cleanup = () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
        notificationUnsubscribersRef.current.delete(cleanup);
      };
      
      notificationUnsubscribersRef.current.add(cleanup);
      
      console.log('[useSocketConnection] Subscribed to notifications');
      
      return cleanup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to notifications';
      console.error('[useSocketConnection] Subscription error:', errorMessage);
      setError(errorMessage);
      return () => {};
    }
  }, [getSDK]);
  
  // Auto-connect on mount if SDK is available
  useEffect(() => {
    if (!connectionInitializedRef.current) {
      const sdk = getSDK();
      if (sdk) {
        // Check if already connected
        try {
          const connectionStatus = sdk.getConnectionStatus?.();
          if (connectionStatus?.connected) {
            setIsConnected(true);
            connectionInitializedRef.current = true;
          } else {
            // Try to connect
            connect();
          }
        } catch {
          // If getConnectionStatus doesn't exist or fails, try to connect
          connect();
        }
      }
    }
    
    // Cleanup on unmount
    return () => {
      // Note: We don't disconnect on unmount to allow the connection to persist
      // across component remounts. Individual subscriptions will be cleaned up.
    };
  }, [connect, getSDK]);
  
  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    connectionState: {
      isConnected,
      isConnecting,
      error,
    },
    
    // Connection methods
    connect,
    disconnect,
    reconnect,
    
    // Event subscription methods
    subscribeToOrderStatus,
    subscribeToWalletUpdate,
    subscribeToPortfolioUpdate,
    subscribeToConnectionChange,
    subscribeToNotification,
    
    // Utility methods
    getSDK,
  };
};

export default useSocketConnection;

