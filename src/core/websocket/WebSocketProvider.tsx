/**
 * WebSocket Provider for Real-time Updates
 * 
 * Handles both wallet and exchange WebSocket connections for:
 * - Balance updates → Portfolio reprocessing
 * - Order status updates → Order details screen updates
 */

import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

// Create WebSocket context
interface WebSocketContextType {
  isConnected: boolean;
  activeOrders: any[];
  registerOrderUpdateCallback: (orderId: string, callback: (order: any) => void) => () => void;
  getOrderStatus: (orderId: string) => any;
  handleBalanceUpdate: (update: any) => Promise<void>;
  handleOrderStatusUpdate: (update: any) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { 
    currentExchangeUser, 
    currentWalletUser, 
    walletAuth, 
    exchangeAuth,
    refreshUserWalletGroups,
    refreshUserExchangeUsers
  } = useWallet();
  const { refreshSupportedCurrencies } = useSupportedCurrencies();
  
  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<Map<string, any>>(new Map());
  
  // Refs for cleanup
  const portfolioUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const orderUpdateCallbacksRef = useRef<Map<string, (order: any) => void>>(new Map());

  // Get authentication tokens
  const getAuthTokens = useCallback(async () => {
    try {
      const walletToken = await walletAuth?.getToken();
      const exchangeToken = await exchangeAuth?.getToken();
      return { walletToken, exchangeToken };
    } catch (error) {
      console.error("Failed to get auth tokens:", error);
      return { walletToken: null, exchangeToken: null };
    }
  }, [walletAuth, exchangeAuth]);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(async () => {
    try {
      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        console.warn("SDK not initialized, skipping WebSocket connection");
        return;
      }

      const { walletToken, exchangeToken } = await getAuthTokens();
      
      if (!walletToken && !exchangeToken) {
        console.warn("No auth tokens available, skipping WebSocket connection");
        return;
      }

      // Connect WebSocket with both tokens
      await sdk.connectWebSocket();
      setIsConnected(true);
      
      console.log("WebSocket connected successfully");
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      setIsConnected(false);
    }
  }, [getAuthTokens]);

  // Handle balance updates
  const handleBalanceUpdate = useCallback(async (update: any) => {
    console.log("Balance update received:", update);
    
    // Debounce portfolio updates to avoid excessive processing
    if (portfolioUpdateTimeoutRef.current) {
      clearTimeout(portfolioUpdateTimeoutRef.current);
    }
    
    portfolioUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        // Refresh portfolio data
        await refreshPortfolio(mainUserWalletGroup?._id, true);
        
        // Refresh wallet groups to get updated balances
        await refreshUserWalletGroups();
        
        console.log("Portfolio refreshed after balance update");
      } catch (error) {
        console.error("Failed to refresh portfolio after balance update:", error);
      }
    }, 1000); // 1 second debounce
  }, [refreshUserWalletGroups]);

  // Handle order status updates
  const handleOrderStatusUpdate = useCallback((update: any) => {
    console.log("Order status update received:", update);
    
    const { order, status } = update;
    if (!order?._id) return;
    
    // Update active orders map
    setActiveOrders(prev => {
      const newMap = new Map(prev);
      newMap.set(order._id, { ...order, status });
      return newMap;
    });
    
    // Notify any registered callbacks for this order
    const callback = orderUpdateCallbacksRef.current.get(order._id);
    if (callback) {
      callback({ ...order, status });
    }
    
    // Handle specific status transitions
    switch (status) {
      case "DEPOSIT_CONFIRMING":
      case "DEPOSIT_CONFIRMED":
      case "WITHDRAWAL_CONFIRMING":
      case "WITHDRAWAL_CONFIRMED":
        console.log(`Order ${order._id} status: ${status}`);
        break;
      case "FILLED":
        console.log(`Order ${order._id} completed successfully`);
        // Trigger balance update to refresh portfolio
        handleBalanceUpdate({ type: 'order_completed', orderId: order._id });
        break;
      case "FAILED":
      case "EXPIRED":
        console.log(`Order ${order._id} failed or expired: ${status}`);
        break;
    }
  }, [handleBalanceUpdate]);

  // Handle portfolio updates from backend
  const handlePortfolioUpdate = useCallback(async (update: any) => {
    console.log("Portfolio update received:", update);
    
    const { type, data } = update;
    if (type === 'balance_update' && data?.updates?.length > 0) {
      await handleBalanceUpdate(update);
    }
  }, [handleBalanceUpdate]);

  // Set up WebSocket event listeners
  useEffect(() => {
    if (!isConnected) return;

    const sdk = zapSDKService.getSDK();
    if (!sdk) return;

    // Set up event listeners
    const unsubscribeWalletUpdate = sdk.onWalletUpdate(handleBalanceUpdate);
    const unsubscribeOrderUpdate = sdk.onOrderStatusUpdate(handleOrderStatusUpdate);
    const unsubscribePortfolioUpdate = sdk.onPortfolioUpdate(handlePortfolioUpdate);
    const unsubscribeConnectionChange = sdk.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected) {
        console.log("WebSocket reconnected");
      } else {
        console.log("WebSocket disconnected");
      }
    });

    // Cleanup function
    return () => {
      unsubscribeWalletUpdate?.();
      unsubscribeOrderUpdate?.();
      unsubscribePortfolioUpdate?.();
      unsubscribeConnectionChange?.();
    };
  }, [isConnected, handleBalanceUpdate, handleOrderStatusUpdate, handlePortfolioUpdate]);

  // Initialize WebSocket when user is authenticated
  useEffect(() => {
    if (currentWalletUser || currentExchangeUser) {
      initializeWebSocket();
    }
  }, [currentWalletUser, currentExchangeUser, initializeWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (portfolioUpdateTimeoutRef.current) {
        clearTimeout(portfolioUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Register order update callback (for order details screens)
  const registerOrderUpdateCallback = useCallback((orderId: string, callback: (order: any) => void) => {
    orderUpdateCallbacksRef.current.set(orderId, callback);
    
    // Return cleanup function
    return () => {
      orderUpdateCallbacksRef.current.delete(orderId);
    };
  }, []);

  // Get current order status
  const getOrderStatus = useCallback((orderId: string) => {
    return activeOrders.get(orderId);
  }, [activeOrders]);

  // WebSocket context value
  const contextValue = {
    isConnected,
    activeOrders: Array.from(activeOrders.values()),
    registerOrderUpdateCallback,
    getOrderStatus,
    handleBalanceUpdate,
    handleOrderStatusUpdate,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};

export default WebSocketProvider;
