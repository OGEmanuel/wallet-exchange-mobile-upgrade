/**
 * Hook for handling order status updates in swap screens
 * 
 * Integrates with WebSocket to receive real-time order status updates
 * and manages the transition between order details and progress screens
 */

import { useWebSocket } from "@/src/core/websocket/WebSocketProvider";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOrderStatusUpdatesProps {
  orderId?: string;
  onStatusChange?: (order: any, status: string) => void;
  onProgressUpdate?: (order: any, progress: number) => void;
}

export const useOrderStatusUpdates = ({
  orderId,
  onStatusChange,
  onProgressUpdate
}: UseOrderStatusUpdatesProps = {}) => {
  const { 
    registerOrderUpdateCallback, 
    getOrderStatus, 
    isConnected 
  } = useWebSocket();
  
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<string>("PENDING");
  const [progress, setProgress] = useState<number>(0);
  const [isOrderActive, setIsOrderActive] = useState<boolean>(false);
  
  const callbackRef = useRef<(() => void) | null>(null);

  // Calculate progress based on order status
  const calculateProgress = useCallback((status: string): number => {
    switch (status) {
      case "PENDING":
        return 0;
      case "DEPOSIT_CONFIRMING":
        return 25;
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
        return 0;
      default:
        return 0;
    }
  }, []);

  // Get progress step name
  const getProgressStep = useCallback((status: string): string => {
    switch (status) {
      case "PENDING":
        return "Confirming";
      case "DEPOSIT_CONFIRMING":
        return "Confirming";
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
      default:
        return "Processing";
    }
  }, []);

  // Handle order status updates
  const handleOrderUpdate = useCallback((order: any) => {
    console.log("Order status update received:", order);
    
    setCurrentOrder(order);
    setOrderStatus(order.status);
    
    const newProgress = calculateProgress(order.status);
    setProgress(newProgress);
    
    const stepName = getProgressStep(order.status);
    
    // Notify parent components
    onStatusChange?.(order, order.status);
    onProgressUpdate?.(order, newProgress);
    
    // Update active state
    const isActive = order.status !== "FILLED" && 
                    order.status !== "FAILED" && 
                    order.status !== "EXPIRED";
    setIsOrderActive(isActive);
    
    console.log(`Order ${order._id} status: ${order.status} (${stepName}) - Progress: ${newProgress}%`);
  }, [calculateProgress, getProgressStep, onStatusChange, onProgressUpdate]);

  // Register for order updates when orderId is provided
  useEffect(() => {
    if (!orderId || !isConnected) return;
    
    // Clean up previous callback
    if (callbackRef.current) {
      callbackRef.current();
    }
    
    // Register new callback
    callbackRef.current = registerOrderUpdateCallback(orderId, handleOrderUpdate);
    
    // Get current order status if available
    const existingOrder = getOrderStatus(orderId);
    if (existingOrder) {
      handleOrderUpdate(existingOrder);
    }
    
    return () => {
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
    };
  }, [orderId, isConnected, registerOrderUpdateCallback, handleOrderUpdate, getOrderStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    };
  }, []);

  return {
    currentOrder,
    orderStatus,
    progress,
    isOrderActive,
    isConnected,
    getProgressStep: () => getProgressStep(orderStatus),
    getCurrentStep: () => getProgressStep(orderStatus),
    isCompleted: orderStatus === "FILLED",
    isFailed: orderStatus === "FAILED" || orderStatus === "EXPIRED",
    isProcessing: isOrderActive && orderStatus !== "PENDING",
  };
};

export default useOrderStatusUpdates;
