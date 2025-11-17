export interface MarketTokenModel {
  rate?: number;
  dailyChange?: number;
  change1h?: number;
  change24h?: number;
  marketCap?: number;
  currencyId?: CurrencyID;
  symbol?: string;
}

interface CurrencyID {
  volatility?: number;
  preferredRatesProviders?: string[];
  preferredTokenMetricsProviders?: string[];
  preferredNewsProviders?: string[];
  maxSupply?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  ath?: number;
  _id?: string;
  name?: string;
  code?: string;
  symbol?: string;
  isCrypto?: boolean;
  buyRate?: number;
  sellRate?: number;
  isActive?: boolean;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  logo?: string;
}
