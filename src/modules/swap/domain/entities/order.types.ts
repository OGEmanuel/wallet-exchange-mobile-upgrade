export interface CreateOrderRequest {
  buyAmount?: number;
  sellAmount?: number;
  buySupportedCurrencyId: string;
  sellSupportedCurrencyId: string;
  withdrawalAddress?: string;
}

// Re-export SDK types for consistency
export { OrderStatuses } from "@zap/blockchain-sdk";

// Use the SDK's CreateOrderResponseData as our main interface
export type CreateOrderResponse = import("@zap/blockchain-sdk").CreateOrderResponseData;

export interface OrderError {
  code: string;
  message: string;
  details?: any;
}

// Re-export order status types
export type {
  Order,
  OrderStatus,
  OrderFlow,
  OrderStatusUpdate,
  OrderStatusUpdateCallback,
  FilteredOrderStatusUpdateCallback,
  OrderStatusFilter,
  OrderStatusSubscriptionStatus,
  OrderStatusError,
  OrderUserId,
  OrderCurrency,
  OrderAccount,
} from './order-status.types';
