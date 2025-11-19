/**
 * Hook for handling order status updates in swap screens
 * 
 * Integrates with WebSocket to receive real-time order status updates
 * and manages the transition between order details and progress screens
 * 
 * @example
 * ```tsx
 * const { orderStatus, progress, error, isLoading } = useOrderStatusUpdates({
 *   orderId: 'order123',
 *   onStatusChange: (order, status) => console.log('Status changed:', status),
 *   onProgressUpdate: (order, progress) => console.log('Progress:', progress),
 * });
 * ```
 */

import { useWebSocket } from "@/src/core/websocket/WebSocketProvider";
import type {
  Order,
  OrderStatus,
  OrderStatusFilter,
} from "@/src/modules/swap/domain/entities/order.types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOrderStatusUpdatesProps {
  orderId?: string;
  onStatusChange?: (order: Order, status: OrderStatus) => void;
  onProgressUpdate?: (order: Order, progress: number) => void;
  filter?: OrderStatusFilter;
  enabled?: boolean; // Allow disabling the hook
  debounceMs?: number; // Debounce time for status updates
}

export const useOrderStatusUpdates = ({
  orderId,
  onStatusChange,
  onProgressUpdate,
  filter,
  enabled = true,
  debounceMs = 100,
}: UseOrderStatusUpdatesProps = {}) => {
  const { 
    registerOrderUpdateCallback, 
    getOrderStatus, 
    isConnected,
    removeOrderStatusUpdate,
    getOrderStatusSubscriptionStatus,
  } = useWebSocket();
  
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("PENDING");
  const [progress, setProgress] = useState<number>(0);
  const [isOrderActive, setIsOrderActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<ReturnType<typeof getOrderStatusSubscriptionStatus> | null>(null);
  
  const callbackRef = useRef<(() => void) | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedUpdateRef = useRef<string | null>(null);

  /**
   * Calculate progress based on order status
   */
  const calculateProgress = useCallback((status: OrderStatus): number => {
    switch (status) {
      case "PENDING":
        return 0;
      case "depositConfirming":
      case "DEPOSIT_CONFIRMING":
        return 25;
      case "depositConfirmed":
      case "DEPOSIT_CONFIRMED":
        return 50;
      case "WITHDRAWAL_CONFIRMING":
        return 75;
      case "WITHDRAWAL_CONFIRMED":
        return 90;
      case "FILLED":
        return 100;
      case "FAILED":
      case "EXPIRED":
      case "CANCELLED":
        return 0;
      default:
        return 0;
    }
  }, []);

  /**
   * Get progress step name based on order status
   */
  const getProgressStep = useCallback((status: OrderStatus): string => {
    switch (status) {
      case "PENDING":
        return "Confirming";
      case "depositConfirming":
      case "DEPOSIT_CONFIRMING":
        return "Confirming";
      case "depositConfirmed":
      case "DEPOSIT_CONFIRMED":
        return "Swapping";
      case "WITHDRAWAL_CONFIRMING":
        return "Swapping";
      case "WITHDRAWAL_CONFIRMED":
        return "Sending";
      case "FILLED":
        return "Completed";
      case "FAILED":
        return "Failed";
      case "EXPIRED":
        return "Expired";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Processing";
    }
  }, []);

  /**
   * Check if order matches filter criteria
   */
  const matchesFilter = useCallback((order: Order, filter?: OrderStatusFilter): boolean => {
    if (!filter) return true;

    if (filter.orderId && order._id !== filter.orderId) return false;
    if (filter.userId && order.userId?._id !== filter.userId) return false;
    if (filter.flow && order.flow !== filter.flow && 
        (Array.isArray(filter.flow) ? !filter.flow.includes(order.flow) : true)) return false;
    if (filter.currencyCode && order.currencyId?.code !== filter.currencyCode) return false;
    if (filter.currencyId && order.currencyId?._id !== filter.currencyId) return false;
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      if (!statuses.includes(order.status)) return false;
    }

    return true;
  }, []);

  /**
   * Handle order status updates with debouncing and filtering
   */
  const handleOrderUpdate = useCallback((order: Order) => {
    try {
      // Apply filter if provided
      if (!matchesFilter(order, filter)) {
        return;
      }

      // Prevent duplicate processing (same order and status)
      const updateKey = `${order._id}:${order.status}`;
      if (lastProcessedUpdateRef.current === updateKey) {
        return;
      }

      // Clear previous debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the update processing
      debounceTimeoutRef.current = setTimeout(() => {
        try {
          setIsLoading(false);
          setError(null);
          
          setCurrentOrder(order);
          setOrderStatus(order.status);
          
          const newProgress = calculateProgress(order.status);
          setProgress(newProgress);
          
          const stepName = getProgressStep(order.status);
          
          // Update active state
          const isActive = order.status !== "FILLED" && 
                          order.status !== "FAILED" && 
                          order.status !== "EXPIRED" &&
                          order.status !== "CANCELLED";
          setIsOrderActive(isActive);
          
          // Mark as processed
          lastProcessedUpdateRef.current = updateKey;
          
          // Notify parent components
          onStatusChange?.(order, order.status);
          onProgressUpdate?.(order, newProgress);
          
          console.log(`[useOrderStatusUpdates] Order ${order._id} status: ${order.status} (${stepName}) - Progress: ${newProgress}%`);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error processing order update';
          console.error(`[useOrderStatusUpdates] Error processing order update:`, err);
          setError(errorMessage);
        }
      }, debounceMs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error handling order update';
      console.error(`[useOrderStatusUpdates] Error handling order update:`, err);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [calculateProgress, getProgressStep, onStatusChange, onProgressUpdate, filter, matchesFilter, debounceMs]);

  // Update subscription status periodically
  useEffect(() => {
    if (!enabled || !getOrderStatusSubscriptionStatus) return;

    const updateSubscriptionStatus = () => {
      try {
        const status = getOrderStatusSubscriptionStatus();
        setSubscriptionStatus(status);
      } catch (err) {
        console.error('[useOrderStatusUpdates] Error getting subscription status:', err);
      }
    };

    updateSubscriptionStatus();
    const interval = setInterval(updateSubscriptionStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enabled, getOrderStatusSubscriptionStatus]);

  // Register for order updates when orderId is provided
  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
      return;
    }

    if (!orderId || !isConnected) {
      setIsLoading(true);
      return;
    }
    
    try {
      setIsLoading(false);
      setError(null);
      
      // Clean up previous callback
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
      
      // Register new callback
      callbackRef.current = registerOrderUpdateCallback(orderId, handleOrderUpdate);
      
      // Get current order status if available
      const existingOrder = getOrderStatus(orderId);
      if (existingOrder) {
        handleOrderUpdate(existingOrder);
      }
      
      console.log(`[useOrderStatusUpdates] Registered for order ${orderId} updates`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register for order updates';
      console.error('[useOrderStatusUpdates] Error registering for order updates:', err);
      setError(errorMessage);
      setIsLoading(false);
    }
    
    return () => {
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
      
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [orderId, isConnected, enabled, registerOrderUpdateCallback, handleOrderUpdate, getOrderStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, []);

  // Manual cleanup function for external use
  const cleanup = useCallback(() => {
    if (orderId && removeOrderStatusUpdate) {
      removeOrderStatusUpdate(orderId);
    }
    if (callbackRef.current) {
      callbackRef.current();
      callbackRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, [orderId, removeOrderStatusUpdate]);

  return {
    // Order data
    currentOrder,
    orderStatus,
    progress,
    
    // State flags
    isOrderActive,
    isConnected,
    isLoading,
    error,
    subscriptionStatus,
    
    // Computed properties
    getProgressStep: () => getProgressStep(orderStatus),
    getCurrentStep: () => getProgressStep(orderStatus),
    isCompleted: orderStatus === "FILLED",
    isFailed: orderStatus === "FAILED" || orderStatus === "EXPIRED" || orderStatus === "CANCELLED",
    isProcessing: isOrderActive && orderStatus !== "PENDING",
    
    // Actions
    cleanup,
  };
};

export default useOrderStatusUpdates;
