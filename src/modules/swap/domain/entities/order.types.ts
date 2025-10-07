export interface CreateOrderRequest {
  buyAmount?: number;
  sellAmount?: number;
  buySupportedCurrencyId: string;
  sellSupportedCurrencyId: string;
  withdrawalAddress?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: "pending" | "processing" | "completed" | "failed";
  baseAmount: number;
  targetAmount: number;
  baseCurrency: {
    symbol: string;
    name: string;
  };
  targetCurrency: {
    symbol: string;
    name: string;
  };
  marketRate: number;
  withdrawalAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderError {
  code: string;
  message: string;
  details?: any;
}
