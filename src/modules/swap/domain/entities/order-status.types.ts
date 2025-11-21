/**
 * Order Status Update Types
 * 
 * Comprehensive type definitions for order status updates received via WebSocket
 * Based on the sample response structure from the backend
 * 
 * @module OrderStatusTypes
 * @see {@link https://docs.zap.exchange} for backend API documentation
 */

/**
 * User object embedded in order
 */
export interface OrderUserId {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Currency object embedded in order
 */
export interface OrderCurrency {
  _id: string;
  name: string;
  code: string;
  isCrypto: boolean;
  logo?: string;
  symbol?: string;
  chainId?: string;
  chainName?: string;
}

/**
 * Account object for deposit/withdrawal accounts
 */
export interface OrderAccount {
  _id: string;
  holderName?: string;
  walletAddress?: string;
  accountNumber?: string;
  bankId?: string;
  bankName?: string;
  type?: 'wallet' | 'bank';
}

/**
 * Order flow type
 */
export type OrderFlow = "BUY" | "SELL";

/**
 * Order status values
 */
export type OrderStatus =
  | "PENDING"
  | "depositConfirming"
  | "depositConfirmed"
  | "DEPOSIT_CONFIRMING"
  | "DEPOSIT_CONFIRMED"
  | "WITHDRAWAL_CONFIRMING"
  | "WITHDRAWAL_CONFIRMED"
  | "FILLED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

/**
 * Order object structure received from WebSocket
 */
export interface Order {
  _id: string;
  userId: OrderUserId;
  flow: OrderFlow;
  currencyId: OrderCurrency;
  status: OrderStatus;
  
  // Amount fields
  openAmount?: number;
  amount: number;
  amountToReceive?: number;
  calculatedAmount?: number;
  
  // Rate fields
  openRate?: number;
  rate: number;
  calculatedRate?: number;
  
  // Account fields
  depositAccountIds?: OrderAccount[];
  withdrawalAccountIds?: OrderAccount[];
  
  // Order relationship fields
  parentOrder?: Order | null;
  childOrder?: Order | null;
  
  // Additional metadata
  provider?: string;
  expiresAt?: string; // ISO date
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  
  // Additional fields that may be present
  [key: string]: any;
}

/**
 * Order Status Update event structure from WebSocket
 */
export interface OrderStatusUpdate {
  order: Order;
  status: OrderStatus;
  timestamp?: string; // ISO date
  previousStatus?: OrderStatus;
}

/**
 * Order status update callback function type
 */
export type OrderStatusUpdateCallback = (update: OrderStatusUpdate) => void;

/**
 * Order status update callback with filter
 */
export type FilteredOrderStatusUpdateCallback = (
  update: OrderStatusUpdate,
  matches: boolean
) => void;

/**
 * Filter criteria for order status updates
 */
export interface OrderStatusFilter {
  orderId?: string;
  userId?: string;
  status?: OrderStatus | OrderStatus[];
  flow?: OrderFlow | OrderFlow[];
  currencyCode?: string;
  currencyId?: string;
}

/**
 * Order status subscription status
 */
export interface OrderStatusSubscriptionStatus {
  isSubscribed: boolean;
  listenerCount: number;
  isConnected: boolean;
  lastUpdate?: string;
}

/**
 * Order status update error
 */
export interface OrderStatusError {
  code: string;
  message: string;
  orderId?: string;
  status?: OrderStatus;
  timestamp: string;
  details?: any;
}

