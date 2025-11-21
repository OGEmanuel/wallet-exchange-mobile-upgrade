/**
 * Hook for handling filtered order status updates
 * 
 * Provides advanced filtering capabilities for order status updates
 * Supports multiple filters with AND/OR logic
 * 
 * @example
 * ```tsx
 * const { filteredOrders, isMatching } = useFilteredOrderStatusUpdates({
 *   filter: {
 *     status: ['DEPOSIT_CONFIRMED', 'WITHDRAWAL_CONFIRMING'],
 *     flow: 'BUY',
 *   },
 *   onMatch: (order) => console.log('Matching order:', order),
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

interface UseFilteredOrderStatusUpdatesProps {
  filter?: OrderStatusFilter;
  onMatch?: (order: Order, status: OrderStatus) => void;
  onNoMatch?: (order: Order, status: OrderStatus) => void;
  enabled?: boolean;
  matchAll?: boolean; // If true, all filter criteria must match (AND logic). If false, any criteria can match (OR logic)
}

/**
 * Check if order matches filter criteria
 * @param order - The order to check
 * @param filter - The filter criteria
 * @param matchAll - If true, all criteria must match (AND). If false, any criteria can match (OR)
 */
const matchesFilterCriteria = (
  order: Order,
  filter: OrderStatusFilter,
  matchAll: boolean = true
): boolean => {
  if (!filter) return true;

  const checks: boolean[] = [];

  // OrderId check
  if (filter.orderId !== undefined) {
    checks.push(order._id === filter.orderId);
  }

  // UserId check
  if (filter.userId !== undefined) {
    checks.push(order.userId?._id === filter.userId);
  }

  // Flow check
  if (filter.flow !== undefined) {
    const flows = Array.isArray(filter.flow) ? filter.flow : [filter.flow];
    checks.push(flows.includes(order.flow));
  }

  // Currency code check
  if (filter.currencyCode !== undefined) {
    checks.push(order.currencyId?.code === filter.currencyCode);
  }

  // Currency ID check
  if (filter.currencyId !== undefined) {
    checks.push(order.currencyId?._id === filter.currencyId);
  }

  // Status check
  if (filter.status !== undefined) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    checks.push(statuses.includes(order.status));
  }

  // If no checks were made, consider it a match
  if (checks.length === 0) return true;

  // Apply AND or OR logic
  return matchAll ? checks.every(check => check) : checks.some(check => check);
};

export const useFilteredOrderStatusUpdates = ({
  filter,
  onMatch,
  onNoMatch,
  enabled = true,
  matchAll = true,
}: UseFilteredOrderStatusUpdatesProps = {}) => {
  const { activeOrders, handleOrderStatusUpdate, isConnected } = useWebSocket();

  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [matchingCount, setMatchingCount] = useState<number>(0);
  const [nonMatchingCount, setNonMatchingCount] = useState<number>(0);

  const filterRef = useRef(filter);
  const matchAllRef = useRef(matchAll);

  // Update refs when props change
  useEffect(() => {
    filterRef.current = filter;
    matchAllRef.current = matchAll;
  }, [filter, matchAll]);

  /**
   * Filter orders based on current filter criteria
   */
  const applyFilter = useCallback(() => {
    if (!enabled || !filterRef.current || activeOrders.length === 0) {
      setFilteredOrders([]);
      return;
    }

    const matching: Order[] = [];
    let matchCount = 0;
    let noMatchCount = 0;

    activeOrders.forEach((order) => {
      const matches = matchesFilterCriteria(order, filterRef.current!, matchAllRef.current);

      if (matches) {
        matching.push(order);
        matchCount++;
        onMatch?.(order, order.status);
      } else {
        noMatchCount++;
        onNoMatch?.(order, order.status);
      }
    });

    setFilteredOrders(matching);
    setMatchingCount(matchCount);
    setNonMatchingCount(noMatchCount);
  }, [activeOrders, enabled, onMatch, onNoMatch]);

  // Apply filter when orders or filter criteria change
  useEffect(() => {
    applyFilter();
  }, [applyFilter, activeOrders, filter]);

  // Re-filter when filter criteria change
  useEffect(() => {
    if (enabled && filter) {
      applyFilter();
    }
  }, [filter, enabled, applyFilter]);

  /**
   * Check if a specific order matches the filter
   */
  const isMatching = useCallback(
    (order: Order): boolean => {
      if (!filter) return true;
      return matchesFilterCriteria(order, filter, matchAll);
    },
    [filter, matchAll]
  );

  /**
   * Get matching orders by a specific status
   */
  const getOrdersByStatus = useCallback(
    (status: OrderStatus | OrderStatus[]): Order[] => {
      const statuses = Array.isArray(status) ? status : [status];
      return filteredOrders.filter((order) => statuses.includes(order.status));
    },
    [filteredOrders]
  );

  /**
   * Get matching orders by flow
   */
  const getOrdersByFlow = useCallback(
    (flow: Order["flow"]): Order[] => {
      return filteredOrders.filter((order) => order.flow === flow);
    },
    [filteredOrders]
  );

  return {
    // Filtered results
    filteredOrders,
    matchingCount,
    nonMatchingCount,

    // Helper functions
    isMatching,
    getOrdersByStatus,
    getOrdersByFlow,

    // State
    isConnected,
    hasFilter: !!filter,
    hasMatches: filteredOrders.length > 0,

    // Actions
    refilter: applyFilter,
  };
};

export default useFilteredOrderStatusUpdates;

