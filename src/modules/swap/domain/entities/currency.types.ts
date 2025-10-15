// Currency types for the swap module
export interface SupportedCurrency {
  __v?: number;
  _id?: string;
  chainId?: ChainId;
  createdAt?: string;
  currencyId?: CurrencyId;
  decimals?: number;
  defaultBalancesProvider?: string;
  defaultBuyProvider?: string;
  defaultSellProvider?: string;
  defaultTradesProvider?: string;
  defaultTransactionsProvider?: string;
  image?: string;
  isActive?: boolean;
  isStable?: boolean;
  preferredBalancesProviders?: string[];
  preferredRPCProviders?: any[];
  preferredTradesProviders?: string[];
  preferredTransactionsProviders?: string[];
  tokenAddress?: string;
  updatedAt?: string;
}

export interface ChainId {
  __v?: number;
  _id?: string;
  chainId?: number;
  createdAt?: string;
  isEVM?: boolean;
  name?: string;
  nativeCurrencyId?: string;
  nativeCurrencySymbol?: string;
  symbol?: string;
  updatedAt?: string;
}

export interface CurrencyId {
  __v?: number;
  _id?: string;
  ath?: number;
  buyRate?: number;
  circulatingSupply?: number;
  code?: string;
  createdAt?: string;
  defaultNewsProvider?: string;
  defaultRatesProvider?: string;
  isActive?: boolean;
  isCrypto?: boolean;
  isStable?: boolean;
  isUserToken?: boolean;
  logo?: string;
  maxSupply?: number;
  name?: string;
  preferredNewsProviders?: string[];
  preferredRatesProviders?: string[];
  preferredTokenMetricsProviders?: any[];
  sellRate?: number;
  symbol?: string;
  totalSupply?: number;
  updatedAt?: string;
  volatility?: number;
}

export interface SupportedCurrenciesResponse {
  data: SupportedCurrency[];
  total: number;
  fiatCount: number;
  cryptoCount: number;
}

export interface UseFetchCurrenciesOptions {
  includeFiat?: boolean;
  enabled?: boolean;
  refetchOnMount?: boolean;
  cacheTime?: number; // in milliseconds
  retryOnError?: boolean;
  maxRetries?: number;
}

export interface UseFetchCurrenciesReturn {
  currencies: SupportedCurrency[];
  fiatCurrencies: SupportedCurrency[];
  cryptoCurrencies: SupportedCurrency[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => Promise<void>;
  lastFetched: Date | null;
  retryCount: number;
  clearCache: () => void;
}

// Type alias for react-native-swap compatibility
export type SupportedCurrencyModel = SupportedCurrency;

// Swap metadata for managing input states
export interface SwapMetaData {
  isDollarMode: boolean;
  dollarValue: string | null | undefined;
  sellInputValue: string;
  receiveInputValue: string;
}

// Swap rate model
export interface SwapRateModel {
  sellAmount?: number;
  buyAmount?: number;
  sellRate?: number;
  buyRate?: number;
  sellCurrency?: SupportedCurrency;
  buyCurrency?: SupportedCurrency;
}

// Fetch swap rate request params
export interface FetchSwapRateRequestParams {
  sellSupportedCurrencyId: string;
  buySupportedCurrencyId: string;
  buyAmount?: number;
  sellAmount?: number;
}

