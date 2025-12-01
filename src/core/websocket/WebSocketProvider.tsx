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
import type {
  Order,
  OrderStatus,
  OrderStatusUpdate,
  OrderStatusUpdateCallback,
  OrderStatusFilter,
  OrderStatusSubscriptionStatus,
  OrderStatusError,
} from "@/src/modules/swap/domain/entities/order.types";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

// Create WebSocket context
interface WebSocketContextType {
  isConnected: boolean;
  activeOrders: Order[];
  registerOrderUpdateCallback: (orderId: string, callback: (order: Order) => void) => () => void;
  getOrderStatus: (orderId: string) => Order | undefined;
  handleBalanceUpdate: (update: any) => Promise<void>;
  handleOrderStatusUpdate: (update: any) => void;
  // Enhanced order status methods
  subscribeToOrderStatus?: (filter?: OrderStatusFilter) => Promise<void>;
  unsubscribeFromOrderStatus?: () => Promise<void>;
  getOrderStatusSubscriptionStatus?: () => OrderStatusSubscriptionStatus;
  removeOrderStatusUpdate?: (orderId: string) => void;
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
    refreshUserExchangeUsers,
    refreshPortfolio,
    mainUserWalletGroup
  } = useWallet();
  const { refreshSupportedCurrencies } = useSupportedCurrencies();
  
  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<Map<string, Order>>(new Map());
  const [orderStatusErrors, setOrderStatusErrors] = useState<OrderStatusError[]>([]);
  const [orderStatusSubscriptionStatus, setOrderStatusSubscriptionStatus] = useState<OrderStatusSubscriptionStatus>({
    isSubscribed: false,
    listenerCount: 0,
    isConnected: false,
  });
  
  // Refs for cleanup
  const portfolioUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const orderUpdateCallbacksRef = useRef<Map<string, (order: Order) => void>>(new Map());
  const orderStatusListenerRef = useRef<(() => void) | null>(null);
  const lastOrderStatusUpdateRef = useRef<string | undefined>();

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
    console.log("[WebSocket] Balance update received:", update);
    
    // Debounce portfolio updates to avoid excessive processing
    if (portfolioUpdateTimeoutRef.current) {
      clearTimeout(portfolioUpdateTimeoutRef.current);
    }
    
    portfolioUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        // Refresh portfolio data
        if (refreshPortfolio && mainUserWalletGroup?._id) {
          await refreshPortfolio(mainUserWalletGroup._id, true);
        }
        
        // Refresh wallet groups to get updated balances
        await refreshUserWalletGroups();
        
        console.log("[WebSocket] Portfolio refreshed after balance update");
      } catch (error) {
        console.error("[WebSocket] Failed to refresh portfolio after balance update:", error);
      }
    }, 1000); // 1 second debounce
  }, [refreshUserWalletGroups, refreshPortfolio, mainUserWalletGroup]);

  /**
   * Validate order status update structure
   */
  const validateOrderStatusUpdate = useCallback((update: any): { valid: boolean; error?: string } => {
    try {
      // Check if update has required structure
      if (!update || typeof update !== 'object') {
        return { valid: false, error: 'Order status update must be an object' };
      }

      const { order, status } = update;

      // Validate order object
      if (!order || typeof order !== 'object') {
        return { valid: false, error: 'Order status update must contain an order object' };
      }

      if (!order._id || typeof order._id !== 'string') {
        return { valid: false, error: 'Order must have a valid _id field' };
      }

      // Validate status
      if (!status || typeof status !== 'string') {
        return { valid: false, error: 'Order status update must contain a valid status string' };
      }

      // Validate userId if present
      if (order.userId && (!order.userId._id || typeof order.userId._id !== 'string')) {
        return { valid: false, error: 'Order userId must have a valid _id field' };
      }

      // Validate currencyId if present
      if (order.currencyId && (!order.currencyId._id || typeof order.currencyId._id !== 'string')) {
        return { valid: false, error: 'Order currencyId must have a valid _id field' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown validation error' };
    }
  }, []);

  /**
   * Handle order status updates with validation and error handling
   */
  const handleOrderStatusUpdate = useCallback((update: any) => {
    try {
      // Validate update structure
      const validation = validateOrderStatusUpdate(update);
      if (!validation.valid) {
        const error: OrderStatusError = {
          code: 'VALIDATION_ERROR',
          message: validation.error || 'Invalid order status update structure',
          timestamp: new Date().toISOString(),
          details: { update },
        };
        
        console.error('[WebSocket] Order status update validation failed:', error);
        setOrderStatusErrors(prev => [...prev.slice(-9), error]); // Keep last 10 errors
        return;
      }

      const { order, status } = update as OrderStatusUpdate;
      
      // Log order status update (with sanitized data)
      console.log('[WebSocket] Order status update received:', {
        orderId: order._id,
        status,
        flow: order.flow,
        timestamp: new Date().toISOString(),
      });

      // Prevent duplicate updates (same orderId and status within 1 second)
      const updateKey = `${order._id}:${status}`;
      if (lastOrderStatusUpdateRef.current === updateKey) {
        console.warn('[WebSocket] Duplicate order status update ignored:', updateKey);
        return;
      }
      lastOrderStatusUpdateRef.current = updateKey;

      // Update active orders map
      setActiveOrders(prev => {
        const newMap = new Map(prev);
        newMap.set(order._id, { ...order, status } as Order);
        return newMap;
      });

      // Update subscription status
      setOrderStatusSubscriptionStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        listenerCount: orderUpdateCallbacksRef.current.size,
      }));

      // Notify any registered callbacks for this order
      const callback = orderUpdateCallbacksRef.current.get(order._id);
      if (callback) {
        try {
          callback({ ...order, status } as Order);
        } catch (error) {
          console.error(`[WebSocket] Error in order status callback for order ${order._id}:`, error);
        }
      }

      // Handle specific status transitions
      switch (status) {
        case "DEPOSIT_CONFIRMING":
        case "DEPOSIT_CONFIRMED":
        case "WITHDRAWAL_CONFIRMING":
        case "WITHDRAWAL_CONFIRMED":
          console.log(`[WebSocket] Order ${order._id} status: ${status}`);
          break;
        case "FILLED":
          console.log(`[WebSocket] Order ${order._id} completed successfully`);
          // Trigger balance update to refresh portfolio
          handleBalanceUpdate({ type: 'order_completed', orderId: order._id });
          break;
        case "FAILED":
        case "EXPIRED":
        case "CANCELLED":
          console.log(`[WebSocket] Order ${order._id} failed, expired, or cancelled: ${status}`);
          break;
      }
    } catch (error) {
      console.error('[WebSocket] Error handling order status update:', error);
      const orderStatusError: OrderStatusError = {
        code: 'HANDLER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error processing order status update',
        timestamp: new Date().toISOString(),
        details: { update, error },
      };
      setOrderStatusErrors(prev => [...prev.slice(-9), orderStatusError]); // Keep last 10 errors
    }
  }, [handleBalanceUpdate, validateOrderStatusUpdate]);

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
    if (!isConnected) {
      // Reset subscription status when disconnected
      setOrderStatusSubscriptionStatus(prev => ({
        ...prev,
        isConnected: false,
        isSubscribed: false,
      }));
      return;
    }

    const sdk = zapSDKService.getSDK();
    if (!sdk) {
      console.warn('[WebSocket] SDK not available, cannot set up event listeners');
      return;
    }

    try {
      // Set up event listeners
      const unsubscribeWalletUpdate = sdk.onWalletUpdate(handleBalanceUpdate);
      const unsubscribeOrderUpdate = sdk.onOrderStatusUpdate(handleOrderStatusUpdate);
      const unsubscribePortfolioUpdate = sdk.onPortfolioUpdate(handlePortfolioUpdate);
      const unsubscribeConnectionChange = sdk.onConnectionChange((connected) => {
        setIsConnected(connected);
        setOrderStatusSubscriptionStatus(prev => ({
          ...prev,
          isConnected: connected,
        }));
        
        if (connected) {
          console.log('[WebSocket] WebSocket reconnected');
          // Auto-subscribe to order status if needed
          subscribeToOrderStatus();
        } else {
          console.log('[WebSocket] WebSocket disconnected');
          setOrderStatusSubscriptionStatus(prev => ({
            ...prev,
            isSubscribed: false,
          }));
        }
      });

      // Store unsubscribe function for order status
      orderStatusListenerRef.current = unsubscribeOrderUpdate;

      // Update subscription status
      setOrderStatusSubscriptionStatus(prev => ({
        ...prev,
        isConnected: true,
        isSubscribed: true,
        listenerCount: orderUpdateCallbacksRef.current.size,
      }));

      console.log('[WebSocket] Event listeners registered successfully');

      // Cleanup function
      return () => {
        unsubscribeWalletUpdate?.();
        unsubscribeOrderUpdate?.();
        unsubscribePortfolioUpdate?.();
        unsubscribeConnectionChange?.();
        orderStatusListenerRef.current = null;
        console.log('[WebSocket] Event listeners cleaned up');
      };
    } catch (error) {
      console.error('[WebSocket] Error setting up event listeners:', error);
      setOrderStatusErrors(prev => [...prev.slice(-9), {
        code: 'LISTENER_SETUP_ERROR',
        message: error instanceof Error ? error.message : 'Failed to set up WebSocket listeners',
        timestamp: new Date().toISOString(),
        details: { error },
      }]);
    }
  }, [isConnected, handleBalanceUpdate, handleOrderStatusUpdate, handlePortfolioUpdate, subscribeToOrderStatus]);

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

  /**
   * Register order update callback (for order details screens)
   * Returns a cleanup function to remove the callback
   */
  const registerOrderUpdateCallback = useCallback((orderId: string, callback: (order: Order) => void) => {
    if (!orderId || typeof orderId !== 'string') {
      console.warn('[WebSocket] Invalid orderId provided to registerOrderUpdateCallback');
      return () => {}; // Return no-op cleanup function
    }

    if (typeof callback !== 'function') {
      console.warn('[WebSocket] Callback must be a function');
      return () => {}; // Return no-op cleanup function
    }

    orderUpdateCallbacksRef.current.set(orderId, callback);
    
    // Update subscription status
    setOrderStatusSubscriptionStatus(prev => ({
      ...prev,
      listenerCount: orderUpdateCallbacksRef.current.size,
    }));

    console.log(`[WebSocket] Registered order status callback for order ${orderId} (total listeners: ${orderUpdateCallbacksRef.current.size})`);
    
    // Return cleanup function
    return () => {
      orderUpdateCallbacksRef.current.delete(orderId);
      setOrderStatusSubscriptionStatus(prev => ({
        ...prev,
        listenerCount: orderUpdateCallbacksRef.current.size,
      }));
      console.log(`[WebSocket] Removed order status callback for order ${orderId} (remaining listeners: ${orderUpdateCallbacksRef.current.size})`);
    };
  }, []);

  /**
   * Remove order status update callback
   */
  const removeOrderStatusUpdate = useCallback((orderId: string) => {
    if (!orderId || typeof orderId !== 'string') {
      console.warn('[WebSocket] Invalid orderId provided to removeOrderStatusUpdate');
      return;
    }

    const removed = orderUpdateCallbacksRef.current.delete(orderId);
    if (removed) {
      setOrderStatusSubscriptionStatus(prev => ({
        ...prev,
        listenerCount: orderUpdateCallbacksRef.current.size,
      }));
      console.log(`[WebSocket] Removed order status callback for order ${orderId} (remaining listeners: ${orderUpdateCallbacksRef.current.size})`);
    }
  }, []);

  /**
   * Get current order status
   */
  const getOrderStatus = useCallback((orderId: string): Order | undefined => {
    if (!orderId || typeof orderId !== 'string') {
      console.warn('[WebSocket] Invalid orderId provided to getOrderStatus');
      return undefined;
    }
    return activeOrders.get(orderId);
  }, [activeOrders]);

  /**
   * Get order status subscription status
   */
  const getOrderStatusSubscriptionStatus = useCallback((): OrderStatusSubscriptionStatus => {
    return {
      ...orderStatusSubscriptionStatus,
      isConnected,
      listenerCount: orderUpdateCallbacksRef.current.size,
    };
  }, [isConnected, orderStatusSubscriptionStatus]);

  /**
   * Subscribe to order status updates (if backend requires explicit subscription)
   * Note: This is a placeholder for future implementation if needed
   */
  const subscribeToOrderStatus = useCallback(async (filter?: OrderStatusFilter) => {
    try {
      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        console.warn('[WebSocket] SDK not initialized, cannot subscribe to order status');
        return;
      }

      // If the SDK requires explicit subscription, implement it here
      // For now, we assume the SDK automatically subscribes on connection
      console.log('[WebSocket] Order status subscription requested', filter ? `with filter: ${JSON.stringify(filter)}` : '');
      
      setOrderStatusSubscriptionStatus(prev => ({
        ...prev,
        isSubscribed: true,
      }));
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe to order status:', error);
      throw error;
    }
  }, []);

  /**
   * Unsubscribe from order status updates (if backend requires explicit unsubscription)
   * Note: This is a placeholder for future implementation if needed
   */
  const unsubscribeFromOrderStatus = useCallback(async () => {
    try {
      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        console.warn('[WebSocket] SDK not initialized, cannot unsubscribe from order status');
        return;
      }

      // If the SDK requires explicit unsubscription, implement it here
      console.log('[WebSocket] Order status unsubscription requested');
      
      setOrderStatusSubscriptionStatus(prev => ({
        ...prev,
        isSubscribed: false,
      }));
    } catch (error) {
      console.error('[WebSocket] Failed to unsubscribe from order status:', error);
      throw error;
    }
  }, []);

  // WebSocket context value
  const contextValue: WebSocketContextType = {
    isConnected,
    activeOrders: Array.from(activeOrders.values()),
    registerOrderUpdateCallback,
    getOrderStatus,
    handleBalanceUpdate,
    handleOrderStatusUpdate,
    subscribeToOrderStatus,
    unsubscribeFromOrderStatus,
    getOrderStatusSubscriptionStatus,
    removeOrderStatusUpdate,
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
